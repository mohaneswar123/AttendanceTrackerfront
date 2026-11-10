import React, { useState } from 'react';
import useDismiss from '../../hooks/useDismiss';

export const PERIODS = [
  { id: 'term', label: 'This term' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' }
];

export const periodLabel = (id) => (PERIODS.find(p => p.id === id) || PERIODS[0]).label;

/** How far back each period reaches, as a YYYY-MM-DD, or null for everything */
export const periodStart = (id, today) => {
  if (id === 'month') return `${today.slice(0, 7)}-01`;
  if (id === 'all') return null;
  // A term is about three months. It is a rolling window rather than real term dates,
  // which would be setup to do and to keep up to date; the page prints the range it used
  // so there is nothing to guess at.
  const date = new Date(`${today}T00:00:00`);
  date.setDate(date.getDate() - 89);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** The stretch Reports counts, chosen from the header */
function PeriodSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Period: ${periodLabel(value)}`}
        className="h-11 pl-4 pr-3 rounded-full bg-background-paper border border-line flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-white"
      >
        {periodLabel(value)}
        <svg className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div role="listbox" aria-label="Period" className="absolute right-0 top-full mt-1 z-30 w-44 overlay py-1">
          {PERIODS.map(period => (
            <button
              key={period.id}
              type="button"
              role="option"
              aria-selected={period.id === value}
              onClick={() => {
                setOpen(false);
                onChange(period.id);
              }}
              className={`w-full text-left px-4 py-3 md:py-2.5 text-sm hover:bg-white/5 ${period.id === value
                ? 'font-bold text-attendance'
                : 'text-slate-300'}`}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PeriodSelect;
