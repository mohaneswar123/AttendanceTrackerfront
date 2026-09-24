import React from 'react';
import { DAYS, DAY_LONG, DAY_SHORT, categoryOf, timeRange, todayDay } from '../../utils/timetable';

// The whole week at a glance: seven columns on desktop, stacked cards on phones
function WeekOverview({ activitiesByDay, onDayClick }) {
  const today = todayDay();

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {DAYS.map(day => {
        const activities = activitiesByDay[day] || [];
        return (
          <section
            key={day}
            aria-label={DAY_LONG[day]}
            className={`rounded-2xl border p-3 ${day === today ? 'bg-primary-500/10 border-primary-500/30' : 'bg-slate-900/60 border-white/10'}`}
          >
            <button
              type="button"
              onClick={() => onDayClick(day)}
              className="w-full text-left mb-2 flex items-baseline justify-between gap-2 md:block"
            >
              <span className={`text-sm font-bold ${day === today ? 'text-primary-200' : 'text-white'}`}>
                <span className="md:hidden">{DAY_LONG[day]}</span>
                <span className="hidden md:inline">{DAY_SHORT[day]}</span>
              </span>
              <span className="text-xs text-slate-500 md:block md:mt-0.5">
                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
              </span>
            </button>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-500">Nothing planned</p>
            ) : (
              <ul className="space-y-1.5">
                {activities.map(activity => (
                  <li key={activity.id} className={`px-2 py-1.5 rounded-lg border text-xs ${categoryOf(activity.category).badge}`}>
                    <p className="font-semibold truncate">{activity.title}</p>
                    <p className="opacity-80">{timeRange(activity)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default WeekOverview;
