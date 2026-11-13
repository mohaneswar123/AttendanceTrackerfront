import React from 'react';
import { Link } from 'react-router-dom';
import { pairPlanWithRecords, subjectTone } from '../../utils/attendance';
import { CheckIcon, CloseIcon } from '../icons';

const STATUS_BADGE = {
  Present: 'bg-emerald-500/15 text-emerald-300',
  Absent: 'bg-rose-500/15 text-rose-300',
  'No Class': 'bg-slate-500/15 text-slate-300'
};

/**
 * The planned day as a checklist: one tap on present or absent per class.
 *
 * This is what the weekly plan exists for. The form below can still record anything, but
 * a planned day should not make the student answer "which subject, how long?" six times —
 * the plan already knows, so each class needs only the one fact the plan cannot: what
 * happened.
 *
 * A row that already has a record for the day shows its status instead of the buttons;
 * undoing or correcting it stays where it always was, in the marked list and History,
 * with their confirmations. "No class" is the small third option for a cancelled class —
 * it keeps the row answered without counting against the percentage.
 */
function PlannedChecklist({ planned, dayRecords, subjects, dayName, saving, onMark }) {
  const rows = pairPlanWithRecords(planned, dayRecords);
  const done = rows.filter(row => row.record).length;
  const subjectOf = (id) => (subjects || []).find(subject => subject._id === id);

  return (
    <section className="surface p-4 space-y-3" aria-label={`Planned classes for ${dayName}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-white">{dayName}'s classes</h2>
        <span className="text-sm text-slate-400">{done} of {rows.length} marked</span>
      </div>

      <ul className="divide-y divide-line">
        {rows.map((row, index) => {
          const subject = subjectOf(row.subjectId);
          const tone = subjectTone(subject || { name: '' });
          return (
            <li key={`${row.subjectId}-${index}`} className="flex items-center gap-2.5 py-1.5">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tone.dot}`} aria-hidden="true" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-white truncate">
                  {subject?.name || 'Removed subject'}
                </span>
                <span className="block text-sm text-slate-400">{row.hours} {row.hours === 1 ? 'hr' : 'hrs'}</span>
              </span>

              {row.record ? (
                <span className={`h-8 px-3 rounded-full grid place-items-center text-xs font-bold shrink-0 ${STATUS_BADGE[row.record.status] || STATUS_BADGE['No Class']}`}>
                  {row.record.status}
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onMark(row, 'Present')}
                    disabled={saving}
                    aria-label={`${subject?.name || 'Class'}, ${row.hours} hr: present`}
                    className="w-11 h-11 shrink-0 grid place-items-center rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMark(row, 'Absent')}
                    disabled={saving}
                    aria-label={`${subject?.name || 'Class'}, ${row.hours} hr: absent`}
                    className="w-11 h-11 shrink-0 grid place-items-center rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                  {/* The small third option: cancelled, counted against nothing */}
                  <button
                    type="button"
                    onClick={() => onMark(row, 'No Class')}
                    disabled={saving}
                    aria-label={`${subject?.name || 'Class'}, ${row.hours} hr: no class`}
                    className="w-11 h-11 shrink-0 grid place-items-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 disabled:opacity-50"
                  >
                    <span className="block w-3.5 h-0.5 rounded bg-current" aria-hidden="true" />
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-sm text-slate-400">✓ present · ✕ absent · — no class</p>
        <Link
          to="/attendance/plan"
          className="h-11 px-2 -mr-2 inline-flex items-center text-sm font-semibold text-attendance underline underline-offset-2 shrink-0"
        >
          Edit this day
        </Link>
      </div>
    </section>
  );
}

export default PlannedChecklist;
