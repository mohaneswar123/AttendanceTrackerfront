import React from 'react';
import { DAYS, DAY_LONG, DAY_SHORT, todayDay } from '../../utils/timetable';

// Monday to Sunday, with a dot on the days that have something planned
function DayTabs({ day, onChange, activitiesByDay }) {
  const today = todayDay();

  return (
    <div className="grid grid-cols-7 gap-1 p-1 rounded-2xl bg-slate-900/60 border border-white/10" role="tablist" aria-label="Day of the week">
      {DAYS.map(value => {
        const selected = value === day;
        const count = activitiesByDay[value]?.length ?? 0;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={selected}
            aria-label={DAY_LONG[value]}
            onClick={() => onChange(value)}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${selected ? 'bg-primary-500/25 text-white' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <span className="block">{DAY_SHORT[value]}</span>
            <span className="mt-1 flex items-center justify-center h-1.5">
              {count > 0 && <span className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-primary-300' : 'bg-slate-500'}`} aria-hidden="true" />}
            </span>
            {value === today && <span className="sr-only">(today)</span>}
          </button>
        );
      })}
    </div>
  );
}

export default DayTabs;
