import React, { useEffect } from 'react';

// A small yes/no dialog: a sheet on phones, centred on larger screens.
// Escape or pressing the backdrop cancels. With `icon`, the dialog is centred around it.
function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger = false, icon = null, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center justify-center md:p-4" onMouseDown={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="overlay w-full md:max-w-sm rounded-b-none md:rounded-xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 animate-slide-up md:animate-fade-in"
      >
        {icon && (
          <div className={`mx-auto w-11 h-11 rounded-full flex items-center justify-center ${danger ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-500/10 text-primary-300'}`} aria-hidden="true">
            {icon}
          </div>
        )}
        <h2 id="confirm-title" className={`font-semibold text-white ${icon ? 'text-center' : ''}`}>{title}</h2>
        {message && <p className={`text-sm text-slate-400 ${icon ? 'text-center' : ''}`}>{message}</p>}
        <div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
          <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} autoFocus className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
