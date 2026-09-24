import React, { useCallback, useState } from 'react';
import useDismiss from '../../hooks/useDismiss';
import { formatShortTime } from '../../utils/calendarDate';
import { categoryOf, timeRange } from '../../utils/timetable';

// Taller on phones so each option is easy to tap
const MENU_ITEM = 'w-full flex items-center gap-2.5 px-4 py-3 md:px-3 md:py-2.5 text-left active:bg-white/10';

function ActivityMenu({ activity, open, onToggle, onClose, onEdit, onDelete }) {
  const ref = useDismiss(open, onClose);

  const choose = (action) => () => {
    onClose();
    action(activity);
  };

  return (
    <div className="relative shrink-0 -mr-1 -mt-1" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`More actions for ${activity.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-3.5 md:p-2 rounded-xl text-current opacity-60 hover:opacity-100 hover:bg-white/10 active:bg-white/10 transition"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-30 w-40 rounded-xl bg-slate-900 border border-white/10 shadow-2xl py-1 text-base md:text-sm">
          <button role="menuitem" onClick={choose(onEdit)} className={`${MENU_ITEM} text-slate-300 hover:bg-white/5`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>
          <button role="menuitem" onClick={choose(onDelete)} className={`${MENU_ITEM} text-rose-400 hover:bg-rose-500/10`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// The day in order: the start time down the left, the activity as a card beside it. Only
// the activities the student created are listed; stretches with nothing planned are left out.
function DayTimeline({ activities, onEdit, onDelete, onAdd }) {
  // Only one card's menu is open at a time, and that card is lifted above the ones below it
  const [openId, setOpenId] = useState(null);
  const closeMenu = useCallback(() => setOpenId(null), []);

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
        const open = openId === activity.id;
        return (
          <li key={activity.id} className={`relative flex items-start gap-3 ${open ? 'z-20' : ''}`}>
            <span className="w-14 md:w-16 shrink-0 pt-3 text-right text-xs font-medium text-slate-500">
              {formatShortTime(activity.startTime)}
            </span>
            <div className={`flex-1 min-w-0 rounded-xl border p-3 flex items-start gap-2 ${categoryOf(activity.category).block}`}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold break-words">{activity.title}</p>
                <p className="mt-0.5 text-xs opacity-75">{timeRange(activity)}</p>
              </div>
              <ActivityMenu
                activity={activity}
                open={open}
                onToggle={() => setOpenId(open ? null : activity.id)}
                onClose={closeMenu}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default DayTimeline;
