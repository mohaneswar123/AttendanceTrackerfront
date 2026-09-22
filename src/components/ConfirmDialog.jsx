import React, { useEffect } from 'react';

// A small yes/no modal. Escape or clicking the backdrop cancels.
function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-5 space-y-4 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h4 id="confirm-title" className="text-white font-semibold">{title}</h4>
        {message && <p className="text-slate-400 text-sm">{message}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary-600 hover:bg-primary-500'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
