import React, { useEffect } from 'react';

// A small yes/no dialog: a bottom sheet on phones, centred on larger screens.
// Escape or tapping the backdrop cancels. With `icon`, the dialog is centred around it.
function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger = false, icon = null, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4" onMouseDown={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full md:max-w-sm rounded-t-3xl md:rounded-2xl bg-slate-900 border border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 shadow-2xl animate-slide-up md:animate-fade-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${danger ? 'bg-rose-500/15 text-rose-400' : 'bg-primary-500/15 text-primary-300'}`} aria-hidden="true">
            {icon}
          </div>
        )}
        <h4 id="confirm-title" className={`text-white font-semibold text-lg md:text-base ${icon ? 'text-center' : ''}`}>{title}</h4>
        {message && <p className={`text-slate-400 text-sm ${icon ? 'text-center' : ''}`}>{message}</p>}
        <div className="grid grid-cols-2 gap-2 pt-1 md:flex md:justify-end">
          <button onClick={onCancel} className="px-4 py-3 md:py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={`px-4 py-3 md:py-2 rounded-xl text-sm font-semibold text-white ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary-600 hover:bg-primary-500'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
