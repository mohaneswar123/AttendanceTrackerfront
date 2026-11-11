import React from 'react';
import { lastSevenDays, shortDay, weekdayShort } from '../../utils/habits';

/**
 * How today is going, and the week behind it.
 *
 * The strip is one bar per day, filled in proportion to how much of that day was kept, so
 * a run of good days reads as a shape rather than a number. Today is outlined instead of
 * filled, because it is not over yet.
 */
function TodayProgress({ done, due, skipped = 0, byDay, average }) {
  const days = lastSevenDays();
  const today = days[days.length - 1];
  const left = Math.max(0, due - done);
  const percent = due > 0 ? Math.round((done / due) * 100) : 0;

  return (
    <section className="surface p-4 space-y-4" aria-label="Today at a glance">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[34px] leading-none font-bold text-white">
            {done}
            <span className="text-slate-400"> of {due}</span>
          </p>
          <p className="text-sm text-slate-400 mt-1.5">
            {due === 0
              ? 'Nothing due today'
              : [
                left > 0 ? `${left} to go` : 'All done',
                skipped > 0 ? `${skipped} skipped` : ''
              ].filter(Boolean).join(' · ')}
          </p>
        </div>
        {due > 0 && (
          <span className="h-8 px-3 shrink-0 rounded-full grid place-items-center text-xs font-bold bg-habits-tint text-habits">
            {percent}% today
          </span>
        )}
      </div>

      <div>
        <div className="flex items-end justify-between gap-1.5 h-16">
          {days.map(day => {
            const share = byDay[day] ?? 0;
            const isToday = day === today;
            return (
              <div key={day} className="flex-1 h-full flex flex-col justify-end">
                <div
                  title={`${shortDay(day)}: ${Math.round(share * 100)}% kept`}
                  aria-label={`${shortDay(day)}, ${Math.round(share * 100)} percent kept`}
                  role="img"
                  className={`w-full rounded-lg overflow-hidden flex flex-col justify-end ${isToday
                    ? 'h-full border-2 border-habits'
                    : 'h-full bg-background-surface'}`}
                >
                  <span
                    className="block w-full rounded-lg bg-habits"
                    style={{ height: `${Math.max(share > 0 ? 12 : 0, share * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between gap-1.5 mt-1.5" aria-hidden="true">
          {days.map(day => (
            <span
              key={day}
              className={`flex-1 text-center text-xs ${day === today ? 'font-bold text-white' : 'text-slate-400'}`}
            >
              {day === today ? 'Today' : weekdayShort(day)}
            </span>
          ))}
        </div>
      </div>

      {average >= 0 && (
        <p className="text-sm text-slate-400">7-day average: {average}% kept</p>
      )}
    </section>
  );
}

export default TodayProgress;
