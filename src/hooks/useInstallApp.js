import { useEffect, useState } from 'react';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

// Whether the app can be installed, and how.
//
// Chrome and Edge fire `beforeinstallprompt`, which has to be kept and replayed from a
// click. iOS Safari fires nothing and has no API, so there we can only say where the
// button is. Once installed, the page runs in standalone mode and there is nothing to offer.
export default function useInstallApp() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault(); // otherwise the browser shows its own mini-infobar and forgets the event
      setPrompt(e);
    };
    const onInstalled = () => {
      setPrompt(null);
      setInstalled(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null); // the event can only be used once
    return outcome === 'accepted';
  };

  return {
    installed,
    canInstall: Boolean(prompt) && !installed,
    // iOS has no prompt, so the only thing left is to say where Add to Home Screen lives
    showIosHint: isIos() && !installed && !prompt,
    install
  };
}
