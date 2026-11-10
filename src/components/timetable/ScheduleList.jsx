import React from 'react';
import { CheckIcon, PencilIcon, TrashIcon } from '../icons';

/**
 * Every schedule the student has, as rows they can act on.
 *
 * The dropdown on Today switches between schedules; this is where they are made, renamed,
 * made active and deleted. The actions are buttons on the row rather than a ⋯ menu behind
 * the timetable's name, which is where they used to hide.
 *
 * Exactly one schedule is active: it is the one the rest of the app reads, so it says so
 * on its own row and the others offer to take its place.
 */
function ScheduleList({ modes, selectedModeId, onSelect, onSetActive, onEdit, onDelete, onCreate }) {
  return (
    <section aria-label="Your schedules" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Your schedules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            The active one is what Today and the Home screen read.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="btn bg-timetable text-white hover:bg-timetable/90 h-10 px-3 shrink-0"
        >
          New schedule
        </button>
      </div>

      <ul className="space-y-2">
        {modes.map(mode => {
          const open = mode.id === selectedModeId;
          const count = mode.activityCount ?? 0;
          return (
            <li key={mode.id} className={`surface p-3 ${open ? 'ring-1 ring-timetable' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none shrink-0" aria-hidden="true">{mode.icon}</span>

                <button
                  type="button"
                  onClick={() => onSelect(mode.id)}
                  aria-label={`Open ${mode.name}`}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                    {mode.name}
                    {mode.active && (
                      <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">Active</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {count === 0 ? 'Nothing in it yet' : `${count} ${count === 1 ? 'activity' : 'activities'} a week`}
                    {open ? ' · open' : ''}
                  </p>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  {!mode.active && (
                    <button
                      type="button"
                      onClick={() => onSetActive(mode)}
                      aria-label={`Make ${mode.name} active`}
                      className="w-10 h-10 rounded-lg grid place-items-center text-slate-400 hover:text-emerald-300 hover:bg-white/5"
                    >
                      <CheckIcon className="w-[18px] h-[18px]" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(mode)}
                    aria-label={`Rename ${mode.name}`}
                    className="w-10 h-10 rounded-lg grid place-items-center text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  >
                    <PencilIcon className="w-[18px] h-[18px]" />
                  </button>
                  {/* The last schedule cannot go: the week has to live somewhere */}
                  <button
                    type="button"
                    onClick={() => onDelete(mode)}
                    disabled={modes.length === 1}
                    aria-label={`Delete ${mode.name}`}
                    title={modes.length === 1 ? 'Your only schedule cannot be deleted' : undefined}
                    className="w-10 h-10 rounded-lg grid place-items-center text-slate-400 hover:text-rose-400 hover:bg-white/5 disabled:opacity-40 disabled:hover:text-slate-400"
                  >
                    <TrashIcon className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default ScheduleList;
