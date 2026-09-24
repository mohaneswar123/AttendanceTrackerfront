import React, { useEffect, useState } from 'react';
import SheetHeader from './SheetHeader';
import { COLOR_NAMES, FIRST_ICONS, MODE_COLORS, MODE_ICONS } from '../../utils/timetable';

// Create or rename a mode: a bottom sheet on phones, centred on larger screens
function ModeFormModal({ mode, onSave, onClose }) {
  const [name, setName] = useState(mode?.name ?? '');
  const [icon, setIcon] = useState(mode?.icon ?? MODE_ICONS[0]);
  const [color, setColor] = useState(mode?.color ?? 'VIOLET');
  // The first few icons are shown; "…" opens the rest
  const [allIcons, setAllIcons] = useState(() => MODE_ICONS.indexOf(mode?.icon) >= FIRST_ICONS);
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

  const shownIcons = allIcons ? MODE_ICONS : MODE_ICONS.slice(0, FIRST_ICONS);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="mode-form-title"
        noValidate
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-xl md:rounded-lg bg-slate-900 border border-line p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 shadow-lg animate-slide-up md:animate-fade-in"
      >
        <SheetHeader id="mode-form-title" title={mode ? 'Edit Mode' : 'Create Mode'} onClose={onClose} />

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
          <span className="label">Icon (emoji)</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Icon">
            {shownIcons.map(option => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={icon === option}
                aria-label={`Icon ${option}`}
                onClick={() => setIcon(option)}
                className={`w-12 h-12 rounded-xl border text-xl transition-colors ${icon === option ? 'bg-primary-500/25 border-primary-500/60' : 'bg-slate-800/50 border-transparent hover:bg-slate-800'}`}
              >
                {option}
              </button>
            ))}
            {!allIcons && (
              <button
                type="button"
                onClick={() => setAllIcons(true)}
                aria-label="Show more icons"
                className="w-12 h-12 rounded-xl border border-transparent bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              >
                …
              </button>
            )}
          </div>
        </div>

        <div>
          <span className="label">Colour</span>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Colour">
            {Object.entries(MODE_COLORS).map(([value, colors]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={color === value}
                aria-label={COLOR_NAMES[value]}
                onClick={() => setColor(value)}
                className={`w-11 h-11 rounded-full ${colors.dot} transition-shadow ${color === value ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        {formError && <p className="text-sm text-rose-400" role="alert">{formError}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-primary-foreground font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : mode ? 'Save Changes' : 'Create Mode'}
        </button>
      </form>
    </div>
  );
}

export default ModeFormModal;
