import React from 'react';
import { DAYS, DAY_LONG, DAY_SHORT, todayDay } from '../../utils/timetable';
import { addDays, fromIsoDate, todayLocal } from '../../utils/date';

// The seven days as a strip with this week's dates on them, so "Tuesday" and "the 29th"
// are the same thing to look at. Monday is the first column, matching the timetable.
function DayTabs({ day, onChange }) {
  const today = todayLocal();
  const mondayOffset = (fromIsoDate(today).getDay() + 6) % 7;
  const monday = addDays(today, -mondayOffset);

  return (
    <div className="flex gap-1.5" role="tablist" aria-label="Day of the week">
      {DAYS.map((value, index) => {
        const date = addDays(monday, index);
        const selected = value === day;
        const isToday = value === todayDay();
        return (
          <button
            key={value}
            role="tab"
            aria-selected={selected}
            aria-label={DAY_LONG[value]}
            onClick={() => onChange(value)}
            className={`flex-1 min-w-0 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors ${selected
              ? 'bg-primary-600 text-primary-foreground'
              : 'surface text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-[11px] font-medium">{DAY_SHORT[value]}</span>
            <span className={`text-sm font-semibold tabular-nums ${selected ? '' : isToday ? 'text-primary-400' : 'text-white'}`}>
              {Number(date.slice(8))}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default DayTabs;
