import React, { useEffect, useState } from 'react';
import { categoryOf, timeRange } from '../../utils/timetable';

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

const startOf = (activity) => timeRange(activity).split(' – ')[0];

// One row: the coloured block, the title, and when it is
function Entry({ activity, note, onClick }) {
  return (
    <button type="button" onClick={() => onClick(activity)} className="w-full text-left flex items-center gap-3">
      <span className={`w-9 h-9 shrink-0 rounded-xl border grid place-items-center ${categoryOf(activity.category).block}`} aria-hidden="true">
        <span className="w-2 h-2 rounded-full bg-current" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-white truncate">{activity.title}</span>
        <span className="block text-sm text-slate-500">{timeRange(activity)}</span>
      </span>
      <span className="shrink-0 text-sm font-medium text-slate-400 tabular-nums whitespace-nowrap">{note}</span>
    </button>
  );
}

// What is on right now and what follows it, read from the clock rather than the list.
// It ticks every half minute, so "25 min left" stays true without a reload.
function TodayOverview({ activities, onEdit }) {
  const [minute, setMinute] = useState(nowMinutes);

  useEffect(() => {
    const timer = setInterval(() => setMinute(nowMinutes()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (activities.length === 0) return null;

  const current = activities.find(a => a.startMinutes <= minute && a.endMinutes > minute) || null;
  const upcoming = activities.filter(a => a.startMinutes > minute);
  const next = upcoming[0] || null;
  const later = upcoming.length - 1;

  // Once the day is behind you there is no now and no next, so say that once
  if (!current && !next) {
    return (
      <section className="surface px-4 py-3" aria-label="Now and next">
        <p className="text-sm text-slate-500">Nothing left planned for today.</p>
      </section>
    );
  }

  return (
    <section className="surface divide-y divide-line" aria-label="Now and next">
      {current ? (
        <div className="p-4">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-400">
              <span className="w-2 h-2 rounded-full bg-primary-600" aria-hidden="true" />
              Happening now
            </span>
            <span className="text-sm text-slate-500">{minutesLabel(current.endMinutes - minute)} left</span>
          </div>
          <Entry activity={current} note="" onClick={onEdit} />
          <div className="mt-3 h-1.5 rounded-full bg-background-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${Math.round(((minute - current.startMinutes) / (current.endMinutes - current.startMinutes)) * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <p className="text-sm text-slate-500">
            {next ? `Nothing on right now · free until ${startOf(next)}` : 'Nothing on right now.'}
          </p>
        </div>
      )}

      <div className="p-4">
        <h2 className="section-title mb-2.5">Up next</h2>
        {next ? (
          <>
            <Entry activity={next} note={`in ${minutesLabel(next.startMinutes - minute)}`} onClick={onEdit} />
            {later > 0 && (
              <p className="mt-3 text-sm text-slate-500">
                Then {later} more {later === 1 ? 'thing' : 'things'} before the day is out.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">That's everything planned for today.</p>
        )}
      </div>
    </section>
  );
}

export default TodayOverview;
