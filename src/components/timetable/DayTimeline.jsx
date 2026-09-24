import React from 'react';
import { formatTime } from '../../utils/calendarDate';
import { categoryOf, durationLabel } from '../../utils/timetable';

// One day in order. Only the activities the student created are listed; stretches with
// nothing planned are simply left out.
function DayTimeline({ activities, onEdit, onDelete, onAdd }) {
  if (!activities.length) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-400">Nothing planned for this day yet.</p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 px-5 py-3 md:py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold"
        >
          + Add an activity
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {activities.map(activity => {
        const category = categoryOf(activity.category);
        return (
          <li key={activity.id} className="rounded-2xl bg-slate-900/60 border border-white/10 p-3 flex items-start gap-3">
            <div className="w-20 md:w-24 shrink-0 text-xs font-semibold text-slate-300 leading-5">
              <div>{formatTime(activity.startTime)}</div>
              <div className="text-slate-500">{formatTime(activity.endTime)}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white break-words">{activity.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {activity.category && (
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wide ${category.badge}`}>
                    {category.label}
                  </span>
                )}
                <span className="text-xs text-slate-400">{durationLabel(activity)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(activity)}
                aria-label={`Edit ${activity.title}`}
                className="p-2.5 md:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button
                type="button"
                onClick={() => onDelete(activity)}
                aria-label={`Delete ${activity.title}`}
                className="p-2.5 md:p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 active:bg-rose-500/10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default DayTimeline;
