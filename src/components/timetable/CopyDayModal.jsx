import React, { useEffect, useState } from 'react';
import { DAYS, DAY_LONG } from '../../utils/timetable';

// Copy one day's activities onto other days. Each target day is replaced, so the days that
// already have something are named before anything is saved.
function CopyDayModal({ fromDay, activitiesByDay, onCopy, onClose }) {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (day) => {
    setError('');
    setSelected(days => (days.includes(day) ? days.filter(d => d !== day) : [...days, day]));
  };

  const replaced = selected.filter(day => (activitiesByDay[day]?.length ?? 0) > 0);
  const sourceCount = activitiesByDay[fromDay]?.length ?? 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!selected.length) {
      setError('Pick at least one day');
      return;
    }
    setSaving(true);
    const result = await onCopy(selected);
    setSaving(false);
    if (!result.success) setFormError(result.message);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="copy-day-title"
        noValidate
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl bg-slate-900 border border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 shadow-2xl animate-slide-up md:animate-fade-in"
      >
        <div>
          <h2 id="copy-day-title" className="text-lg font-semibold text-white">Copy {DAY_LONG[fromDay]}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {sourceCount === 0
              ? `${DAY_LONG[fromDay]} is empty, so the days you pick will be emptied too.`
              : `${sourceCount} ${sourceCount === 1 ? 'activity' : 'activities'} will be copied to the days you pick.`}
          </p>
        </div>

        <div className="space-y-1" role="group" aria-label="Copy to">
          {DAYS.filter(day => day !== fromDay).map(day => {
            const count = activitiesByDay[day]?.length ?? 0;
            return (
              <label key={day} className="flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl hover:bg-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(day)}
                  onChange={() => toggle(day)}
                  className="w-5 h-5 rounded accent-primary-500"
                />
                <span className="flex-1 text-sm font-medium text-slate-200">{DAY_LONG[day]}</span>
                {count > 0 && <span className="text-xs text-slate-500">{count} already</span>}
              </label>
            );
          })}
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        {replaced.length > 0 && (
          <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm" role="status">
            This replaces everything already on {replaced.map(day => DAY_LONG[day]).join(', ')}.
          </p>
        )}

        {formError && <p className="text-sm text-rose-400" role="alert">{formError}</p>}

        <div className="grid grid-cols-2 gap-2 pt-1 md:flex md:justify-end">
          <button type="button" onClick={onClose} className="px-4 py-3 md:py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-3 md:py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {saving ? 'Copying…' : 'Copy'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CopyDayModal;
