import React from 'react';

const OPTIONS = [
  { value: null, label: 'None', active: 'bg-slate-600 text-white border-slate-500' },
  { value: 'LOW', label: 'Low', active: 'bg-slate-500/30 text-slate-100 border-slate-400' },
  { value: 'MEDIUM', label: 'Medium', active: 'bg-amber-500/25 text-amber-200 border-amber-400' },
  { value: 'HIGH', label: 'High', active: 'bg-rose-500/25 text-rose-200 border-rose-400' }
];

// Optional priority; "None" is the default
function PriorityPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Priority">
      {OPTIONS.map(option => (
        <button
          key={option.label}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`px-3.5 py-2.5 md:px-3 md:py-1.5 rounded-lg border text-sm md:text-xs font-semibold transition-colors ${value === option.value ? option.active : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default PriorityPicker;
