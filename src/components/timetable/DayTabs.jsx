import React from 'react';
import { DAYS, DAY_LONG, DAY_SHORT } from '../../utils/timetable';

// Monday to Sunday as chips, seven across so they always fit a phone
function DayTabs({ day, onChange }) {
  return (
    <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Day of the week">
      {DAYS.map(value => {
        const selected = value === day;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={selected}
            aria-label={DAY_LONG[value]}
            onClick={() => onChange(value)}
            className={`py-3 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-colors ${selected
              ? 'bg-primary-600 text-white'
              : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            {DAY_SHORT[value]}
          </button>
        );
      })}
    </div>
  );
}

export default DayTabs;
