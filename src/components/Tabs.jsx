import React from 'react';

// The pill tabs every page uses under its title: a light track with the chosen tab
// raised on a card of its own.
function Tabs({ items, value, onChange, label, className = '' }) {
  return (
    <div role="tablist" aria-label={label} className={`flex p-1 rounded-xl bg-background-surface border border-line ${className}`}>
      {items.map(item => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={`flex-1 h-9 px-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selected
              ? 'bg-background-paper text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-300'}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
