import React, { useEffect, useState } from 'react';
import { MODE_COLORS, MODE_ICONS } from '../../utils/timetable';

const COLOR_NAMES = { VIOLET: 'Violet', CYAN: 'Cyan', EMERALD: 'Emerald', AMBER: 'Amber', ROSE: 'Rose', SLATE: 'Slate' };

// Create or rename a mode: a bottom sheet on phones, centred on larger screens
function ModeFormModal({ mode, onSave, onClose }) {
  const [name, setName] = useState(mode?.name ?? '');
  const [icon, setIcon] = useState(mode?.icon ?? MODE_ICONS[0]);
  const [color, setColor] = useState(mode?.color ?? 'VIOLET');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setError('Enter a name');
      return;
    }
    setError('');
    setSaving(true);
    const result = await onSave({ name: name.trim(), icon, color });
    setSaving(false);
    if (!result.success) setFormError(result.message);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="mode-form-title"
        noValidate
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl bg-slate-900 border border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 shadow-2xl animate-slide-up md:animate-fade-in"
      >
        <h2 id="mode-form-title" className="text-lg font-semibold text-white">{mode ? 'Edit mode' : 'New mode'}</h2>

        <div>
          <label htmlFor="mode-name" className="label">Name</label>
          <input
            id="mode-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="e.g. College Mode"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'mode-name-error' : undefined}
            className="input"
          />
          {error && <p id="mode-name-error" className="mt-1.5 text-sm text-rose-400">{error}</p>}
        </div>

        <div>
          <span className="label">Icon</span>
          <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Icon">
            {MODE_ICONS.map(option => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={icon === option}
                aria-label={`Icon ${option}`}
                onClick={() => setIcon(option)}
                className={`h-12 rounded-xl border text-xl transition-colors ${icon === option ? 'bg-primary-500/25 border-primary-500/50' : 'bg-slate-800/50 border-transparent hover:bg-slate-800'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Colour</span>
          <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Colour">
            {Object.entries(MODE_COLORS).map(([value, colors]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={color === value}
                aria-label={COLOR_NAMES[value]}
                onClick={() => setColor(value)}
                className={`h-12 rounded-xl border flex items-center justify-center transition-colors ${color === value ? 'bg-white/10 border-white/40' : 'bg-slate-800/50 border-transparent hover:bg-slate-800'}`}
              >
                <span className={`w-6 h-6 rounded-full ${colors.dot}`} />
              </button>
            ))}
          </div>
        </div>

        {formError && <p className="text-sm text-rose-400" role="alert">{formError}</p>}

        <div className="grid grid-cols-2 gap-2 pt-1 md:flex md:justify-end">
          <button type="button" onClick={onClose} className="px-4 py-3 md:py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-3 md:py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModeFormModal;
