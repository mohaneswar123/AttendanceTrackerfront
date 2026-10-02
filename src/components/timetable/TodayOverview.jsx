import React, { useEffect, useState } from 'react';
import { categoryOf, timeRange } from '../../utils/timetable';
import { CheckIcon } from '../icons';

const nowMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const minutesLabel = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

// Today read as a clock rather than a list: what is on now, what is next, what is done.
// It ticks every half minute so "8 min left" stays true without a reload.
function TodayOverview({ activities, onEdit }) {
  const [minute, setMinute] = useState(nowMinutes);

  useEffect(() => {
    const timer = setInterval(() => setMinute(nowMinutes()), 30000);
    return () => clearInterval(timer);
  }, []);

  const current = activities.find(a => a.startMinutes <= minute && a.endMinutes > minute) || null;
  const upcoming = activities.filter(a => a.startMinutes > minute);
  const next = upcoming[0] || null;
  const done = activities.filter(a => a.endMinutes <= minute);

  if (activities.length === 0) return null;

  return (
    <div className="space-y-3">
      {current && (
        <section className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-4" aria-label="Happening now">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-400">
              <span className="w-2 h-2 rounded-full bg-primary-600" aria-hidden="true" />
              Happening now
            </span>
            <span className="text-sm text-slate-500">{minutesLabel(current.endMinutes - minute)} left</span>
          </div>

          <button type="button" onClick={() => onEdit(current)} className="w-full text-left flex items-center gap-3">
            <span className={`w-10 h-10 shrink-0 rounded-xl border grid place-items-center ${categoryOf(current.category).block}`} aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-current" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-white truncate">{current.title}</span>
              <span className="block text-sm text-slate-500">{timeRange(current)}</span>
            </span>
          </button>

          <div className="mt-3 h-1.5 rounded-full bg-background-paper overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${Math.round(((minute - current.startMinutes) / (current.endMinutes - current.startMinutes)) * 100)}%` }}
            />
          </div>
        </section>
      )}

      <section className="surface p-4" aria-label="Up next">
        <h2 className="section-title mb-3">Up next</h2>
        {next ? (
          <>
            <button type="button" onClick={() => onEdit(next)} className="w-full text-left flex items-start gap-3">
              <span className="w-16 shrink-0 pt-0.5 text-sm font-medium text-slate-500 tabular-nums whitespace-nowrap">
                {timeRange(next).split(' – ')[0]}
              </span>
              <span className={`flex-1 min-w-0 rounded-lg border-l-4 border-y border-r px-3 py-2 ${categoryOf(next.category).block}`}>
                <span className="block font-semibold truncate">{next.title}</span>
                <span className="block text-xs opacity-75">{minutesLabel(next.endMinutes - next.startMinutes)}</span>
              </span>
            </button>
            {upcoming.length > 1 && (
              <p className="mt-3 pt-3 border-t border-line text-sm text-slate-500">
                Later · {upcoming.length - 1} more {upcoming.length - 1 === 1 ? 'thing' : 'things'} planned today
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">Nothing else planned today.</p>
        )}
      </section>

      {done.length > 0 && (
        <section className="surface p-4" aria-label="Earlier today">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="section-title">Earlier today</h2>
            <span className="badge badge-success">{done.length} done</span>
          </div>
          <ul className="space-y-2.5">
            {done.map(activity => (
              <li key={activity.id} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm text-slate-500 tabular-nums whitespace-nowrap">
                  {timeRange(activity).split(' – ')[0]}
                </span>
                <span className={`w-2 h-2 shrink-0 rounded-full ${categoryOf(activity.category).dot}`} aria-hidden="true" />
                <span className="flex-1 min-w-0 text-sm text-slate-400 truncate">{activity.title}</span>
                <CheckIcon className="w-4 h-4 shrink-0 text-emerald-500" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default TodayOverview;
