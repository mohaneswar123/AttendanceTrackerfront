import React from 'react';
import { lastSevenDays, shortDay, weekdayInitial } from '../../utils/habits';

/**
 * How today is going, and the week behind it. The strip is one circle per day, filled in
 * proportion to how much of that day was kept, so a run of good days is visible at a
 * glance and today is outlined rather than filled until it is finished.
 */
function TodayProgress({ done, due, byDay }) {
  const days = lastSevenDays();
  const today = days[days.length - 1];
  const fraction = due > 0 ? done / due : 0;

  return (
    <section className="surface p-4 space-y-3" aria-label="Today at a glance">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold text-white">
          {due === 0 ? 'Nothing due today' : `${done} of ${due} done today`}
        </p>
        <p className="text-sm text-slate-500 tabular-nums">{Math.round(fraction * 100)}%</p>
      </div>

      <div
        className="h-2 rounded-full bg-background-surface overflow-hidden"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={due}
        aria-label="Habits done today"
      >
        <div className="h-full rounded-full bg-teal-500 transition-[width]" style={{ width: `${fraction * 100}%` }} />
      </div>

      <div className="flex items-end justify-between gap-1 pt-1">
        {days.map(day => {
          const share = byDay[day] ?? 0;
          const isToday = day === today;
          return (
            <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
              <span
                title={`${shortDay(day)}: ${Math.round(share * 100)}% kept`}
                aria-label={`${shortDay(day)}, ${Math.round(share * 100)} percent kept`}
                className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-semibold
                  ${isToday ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-transparent' : ''}
                  ${share >= 1 ? 'bg-teal-500 text-white'
                    : share > 0 ? 'bg-teal-500/40 text-white'
                      : 'bg-background-surface text-slate-500'}`}
              >
                {share >= 1 ? '✓' : ''}
              </span>
              <span className="text-[10px] text-slate-500">{weekdayInitial(day)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TodayProgress;
