import React from 'react';
import useInstallApp from '../hooks/useInstallApp';
import { DownloadIcon } from './icons';

// The install row in Settings. Says one of three things: install it, how to install it
// on iOS, or that it is already installed.
function InstallApp() {
  const { installed, canInstall, showIosHint, install } = useInstallApp();

  return (
    <div className="surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="font-semibold text-white">Install the app</h2>
        <p className="page-subtitle">
          {installed
            ? 'Already installed on this device.'
            : showIosHint
              ? 'In Safari, press Share, then "Add to Home Screen".'
              : canInstall
                ? 'Adds it to your home screen and opens it without the browser bars.'
                : 'Your browser has not offered this yet. Try Chrome or Edge, or your browser menu.'}
        </p>
      </div>
      {canInstall && (
        <button onClick={install} className="btn btn-primary shrink-0">
          <DownloadIcon className="w-4 h-4" />
          Install
        </button>
      )}
      {installed && <span className="badge badge-success shrink-0">Installed</span>}
    </div>
  );
}

export default InstallApp;
