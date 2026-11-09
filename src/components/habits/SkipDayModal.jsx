import React, { useEffect, useRef, useState } from 'react';

// The reasons students actually have, so most skips take one tap
const REASONS = ['Unwell', 'Exams', 'Travelling', 'Too busy', 'Rest day'];

/**
 * Why a day was skipped. The reason is optional, because a student who has to justify a
 * sick day will mark it missed instead, and a missed day breaks the streak.
 */
function SkipDayModal({ habit, onSkip, onClose }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const field = useRef(null);

  useEffect(() => {
    field.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const skip = async (chosen) => {
    setSaving(true);
    setError('');
    const result = await onSkip(chosen || null);
    setSaving(false);
    if (!result?.success) setError(result?.message || 'Could not skip that day');
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Skip today"
        className="w-full md:max-w-sm rounded-t-xl md:rounded-lg overlay p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 animate-slide-up md:animate-fade-in"
      >
        <div>
          <h2 className="font-semibold text-white">Skip today?</h2>
          <p className="text-sm text-slate-500 mt-1">
            A skipped day will not break your {habit.name} streak.
          </p>
        </div>

        {error && <div className="notice notice-danger" role="alert">{error}</div>}

        <div className="flex flex-wrap gap-2">
          {REASONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => skip(option)}
              disabled={saving}
              className="h-10 px-3.5 rounded-full border border-line bg-background-surface text-sm font-medium text-slate-300 hover:text-slate-100 disabled:opacity-50"
            >
              {option}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="skip-reason" className="label">Something else (optional)</label>
          <input
            id="skip-reason"
            ref={field}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Family wedding"
            className="input"
            maxLength={120}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={() => skip(reason)} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : 'Skip today'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SkipDayModal;
