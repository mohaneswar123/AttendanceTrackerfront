import { useEffect, useRef } from 'react';

// Closes a popup on Escape or a press outside it. Put the returned ref on the popup's wrapper.
export default function useDismiss(open, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
      document.removeEventListener('keydown', handle);
    };
  }, [open, close]);
  return ref;
}
