import React, { useEffect, useState } from 'react';

// Tailwind needs whole class names, so the column counts are listed here
const GRID_COLUMNS = { 4: 'grid-cols-4', 5: 'grid-cols-5' };

const chip = (active, textSize = 'text-sm') =>
  `py-3 md:py-2 rounded-xl ${textSize} font-semibold border transition-colors ${active
    ? 'bg-primary-500/25 text-white border-primary-500/50'
    : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800 active:bg-slate-700'}`;

// Choose a length in minutes: tap a preset, or pick Custom for any whole number from 1 to `max`
function DurationPicker({ label, value, presets, max, onChange }) {
  const [custom, setCustom] = useState(!presets.includes(value));
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const clamp = (minutes) => Math.min(max, Math.max(1, minutes));

  const typed = (text) => {
    setDraft(text);
    const minutes = Number.parseInt(text, 10);
    if (minutes >= 1 && minutes <= max) onChange(minutes);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-semibold text-slate-300">{label}</span>
        <span className="text-sm text-slate-400">{value} min</span>
      </div>
      <div className={`grid ${GRID_COLUMNS[presets.length + 1]} gap-2`} role="radiogroup" aria-label={`${label} length`}>
        {presets.map(minutes => (
          <button
            key={minutes}
            type="button"
            role="radio"
            aria-checked={!custom && value === minutes}
            aria-label={`${minutes} minutes`}
            onClick={() => {
              setCustom(false);
              onChange(minutes);
            }}
            className={chip(!custom && value === minutes)}
          >
            {minutes}
          </button>
        ))}
        {/* Smaller text on narrow phones so "Custom" fits its button */}
        <button type="button" role="radio" aria-checked={custom} onClick={() => setCustom(true)} className={chip(custom, 'text-xs min-[380px]:text-sm')}>
          Custom
        </button>
      </div>

      {custom && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onChange(clamp(value - 1))}
            disabled={value <= 1}
            aria-label={`One minute less ${label.toLowerCase()}`}
            className="w-12 h-12 rounded-xl bg-slate-800 text-2xl text-white active:bg-slate-700 disabled:opacity-40"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            value={draft}
            onChange={(e) => typed(e.target.value)}
            onBlur={() => setDraft(String(value))}
            aria-label={`${label} minutes`}
            className="w-20 h-12 rounded-xl bg-slate-900/60 border border-white/10 text-center text-xl font-bold text-white outline-none focus:border-primary-500"
          />
          <button
            type="button"
            onClick={() => onChange(clamp(value + 1))}
            disabled={value >= max}
            aria-label={`One minute more ${label.toLowerCase()}`}
            className="w-12 h-12 rounded-xl bg-slate-800 text-2xl text-white active:bg-slate-700 disabled:opacity-40"
          >
            +
          </button>
          <span className="text-sm text-slate-400">1–{max} min</span>
        </div>
      )}
    </div>
  );
}

export default DurationPicker;
