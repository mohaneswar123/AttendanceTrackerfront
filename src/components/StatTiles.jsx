import React from 'react';

const TONES = {
  neutral: 'text-white',
  primary: 'text-primary-400',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-rose-500'
};

// A row of small counts: the number first, its name under it.
// `inset` draws them inside a card that already has its own padding.
function StatTiles({ items, inset = false, label = 'Totals' }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(item => (
        <div key={item.label} className={`rounded-xl px-3 py-2.5 ${inset ? 'bg-background-surface' : 'surface'}`}>
          <p className={`text-xl font-bold tabular-nums ${TONES[item.tone] || TONES.neutral}`}>{item.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default StatTiles;
