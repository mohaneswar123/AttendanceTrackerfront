import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import useHomeSummary from '../../hooks/useHomeSummary';
import { FEATURES, toneOf } from '../../features/registry';
import { tally } from '../../utils/attendance';
import { CloseIcon, GridIcon } from '../icons';

/** One short line per app: enough to decide where to go next */
const statusOf = (id, summary, attendance) => {
  switch (id) {
    case 'attendance':
      return attendance.percentage === null ? 'Nothing recorded' : `${attendance.percentage}% so far`;
    case 'tasks': {
      if (!summary.tasks) return '';
      const left = summary.tasks.due + summary.tasks.overdue;
      return left === 0 ? 'All done today' : `${left} due today`;
    }
    case 'habits':
      return summary.habits ? `${summary.habits.done} of ${summary.habits.due} done` : '';
    case 'calendar':
      return summary.calendar ? `${summary.calendar.today} today` : '';
    case 'timetable': {
      if (!summary.timetable) return '';
      const { classes } = summary.timetable;
      return `${classes} ${classes === 1 ? 'class' : 'classes'}`;
    }
    case 'focus':
      if (!summary.focus) return '';
      if (summary.focus.phase === 'FOCUS') return 'Focusing';
      if (summary.focus.phase === 'BREAK') return 'On a break';
      return summary.focus.minutes > 0 ? `${summary.focus.minutes} min today` : 'Ready';
    default:
      return '';
  }
};

/**
 * Jump straight from one feature to another without going back to Home first.
 *
 * It opens from the feature name in the header, which is where someone looks when they
 * want to know, or change, which app they are in.
 *
 * Each app carries a line of its own state, so the sheet answers "where should I go next"
 * rather than only "where can I go". The one you are in says so and is not a link to
 * itself.
 */
function QuickSwitcher({ currentId, lastTab, onClose }) {
  const navigate = useNavigate();
  // Asked for only when the sheet opens, not on every page that can open it
  const summary = useHomeSummary();
  const { attendanceRecords } = useContext(AttendanceContext);
  const attendance = { percentage: tally(attendanceRecords || []).percentage };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center justify-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Switch to"
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl overlay p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 animate-slide-up md:animate-fade-in"
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto md:hidden" aria-hidden="true" />

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-white">Switch app</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 shrink-0 rounded-full grid place-items-center bg-background-surface text-slate-400 hover:text-white"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map(feature => {
            const tone = toneOf(feature.id);
            const current = feature.id === currentId;
            // Back to the tab they were last on in that feature, not always its first
            const path = lastTab?.[feature.id] || feature.tabs[0].path;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => go(path)}
                aria-current={current ? 'true' : undefined}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 text-center transition-colors ${current
                  ? 'border-light-primary bg-background-surface'
                  : 'border-line hover:bg-white/5'}`}
              >
                <span className={`w-11 h-11 rounded-xl grid place-items-center ${tone.tint} ${tone.text}`}>
                  <feature.Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0 w-full">
                  <span className="block text-sm font-bold text-white truncate">{feature.name}</span>
                  <span className="block text-[11px] text-slate-500 truncate mt-0.5">
                    {current
                      ? "You're here"
                      : summary.loading ? '…' : statusOf(feature.id, summary, attendance)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => go('/')}
          className="btn w-full h-12 bg-light-primary text-background hover:opacity-90"
        >
          <GridIcon className="w-4 h-4" />
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default QuickSwitcher;
