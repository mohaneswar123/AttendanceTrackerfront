import React, { useContext, useMemo, useState } from 'react';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import { canMiss, isOnTrack, needToAttend, subjectTone, TARGET, tally } from '../../utils/attendance';
import { todayLocal } from '../../utils/date';

const shortDate = (iso) => new Date(`${iso}T00:00:00`)
  .toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

/** What a subject should do next, in the fewest words that are still true */
const advice = (totals) => {
  if (totals.percentage === null) return { text: 'Nothing counted yet', tone: 'bg-background-surface text-slate-400' };
  if (totals.percentage >= TARGET) {
    const spare = canMiss(totals);
    return spare > 0
      ? { text: `Can skip ${spare} ${spare === 1 ? 'hr' : 'hrs'}`, tone: 'bg-emerald-500/15 text-emerald-300' }
      // Shade 200, not 300: on its own amber tint the lighter one falls under 4.5:1 in the
      // light set, which the contrast audit catches
      : { text: 'No hours to spare', tone: 'bg-amber-500/15 text-amber-200' };
  }
  const needed = needToAttend(totals);
  return { text: `Attend next ${needed} ${needed === 1 ? 'hr' : 'hrs'}`, tone: 'bg-rose-500/15 text-rose-300' };
};

/** A bar with the target marked on it, so a percentage is read against the line that matters */
function TargetBar({ percentage, trackClass = 'bg-background-surface', fillClass }) {
  return (
    <div className={`relative h-2 rounded-full overflow-hidden ${trackClass}`}>
      <div
        className={`h-full rounded-full ${fillClass}`}
        style={{ width: `${Math.max(0, Math.min(100, percentage ?? 0))}%` }}
      />
      <span
        className="absolute inset-y-0 w-0.5 bg-rose-500"
        style={{ left: `${TARGET}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Where attendance stands, over a chosen stretch.
 *
 * Percentages are weighted by class length — a 2-hour class counts twice a 1-hour one —
 * and "No class" never counts, which is why the figures are hours rather than classes.
 */
function AttendanceReports() {
  const { subjects, attendanceRecords } = useContext(AttendanceContext);
  const [lowestFirst, setLowestFirst] = useState(true);
  const today = todayLocal();

  // Everything ever recorded. A percentage that moves when you change a filter is a
  // percentage nobody trusts, and attendance is only ever judged on the whole of it.
  const records = useMemo(() => attendanceRecords || [], [attendanceRecords]);

  const overall = useMemo(() => tally(records), [records]);

  const bySubject = useMemo(() => {
    const rows = (subjects || []).map(subject => ({
      subject,
      totals: tally(records.filter(record => record.subjectId === subject._id))
    })).filter(row => row.totals.counted > 0 || row.totals.percentage !== null);

    return rows.sort((a, b) => {
      const left = a.totals.percentage ?? -1;
      const right = b.totals.percentage ?? -1;
      return lowestFirst ? left - right : right - left;
    });
  }, [subjects, records, lowestFirst]);

  const earliest = useMemo(() => records
    .map(record => String(record.date).slice(0, 10))
    .sort()[0], [records]);

  if (overall.counted === 0) {
    return (
      <section className="surface p-8 text-center" aria-label="Nothing to report yet">
        <h2 className="font-semibold text-white">Nothing to report yet</h2>
        <p className="text-sm text-slate-500 mt-1">
          Record a class and your percentage appears here.
        </p>
      </section>
    );
  }

  const onTrack = isOnTrack(overall.percentage);
  const spare = canMiss(overall);
  const needed = needToAttend(overall);

  return (
    <div className="space-y-4">
      <section className="surface p-4 space-y-4" aria-label="Overall attendance">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label mb-1">Overall</p>
            <p className="text-5xl font-bold tabular-nums text-white leading-none">
              {overall.percentage}<span className="text-2xl text-slate-400">%</span>
            </p>
          </div>
          <span className={`h-8 px-3 rounded-full grid place-items-center text-xs font-bold shrink-0 ${onTrack
            ? 'bg-emerald-500/15 text-emerald-300'
            : 'bg-rose-500/15 text-rose-300'}`}
          >
            {onTrack ? 'On track' : 'Below target'}
          </span>
        </div>

        <div>
          <TargetBar percentage={overall.percentage} fillClass="bg-light-primary" />
          <p className="text-[11px] font-semibold text-rose-400 text-right mt-1">{TARGET}% line</p>
        </div>

        {/* The one sentence a student is here for */}
        <p className="text-lg font-bold text-white leading-snug">
          {onTrack
            ? spare > 0
              ? `You can miss ${spare} ${spare === 1 ? 'hr' : 'hrs'} more and still stay above ${TARGET}%.`
              : `You are exactly on ${TARGET}%. Missing anything drops you below it.`
            : `Attend the next ${needed} ${needed === 1 ? 'hr' : 'hrs'} to get back above ${TARGET}%.`}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: overall.attended, label: 'Attended', tone: 'bg-emerald-500/15 text-emerald-300' },
            { value: overall.missed, label: 'Missed', tone: 'bg-rose-500/15 text-rose-300' },
            { value: overall.counted, label: 'Counted', tone: 'bg-slate-500/15 text-slate-300' }
          ].map(tile => (
            <div key={tile.label} className={`rounded-xl px-3 py-2.5 ${tile.tone}`}>
              <p className="text-xl font-bold tabular-nums leading-none">
                {tile.value}<span className="text-sm font-semibold"> h</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">{tile.label}</p>
            </div>
          ))}
        </div>

        {earliest && (
          <p className="text-xs text-slate-500">
            Counting {shortDate(earliest)} to {shortDate(today)}.
          </p>
        )}
      </section>

      <section aria-label="By subject">
        <div className="flex items-center justify-between gap-3 px-1 mb-2">
          <h2 className="font-semibold text-white">By subject</h2>
          <button
            type="button"
            onClick={() => setLowestFirst(v => !v)}
            aria-label={`Sorted ${lowestFirst ? 'lowest' : 'highest'} first. Change the order.`}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l3 3m-3-3l-3 3" />
            </svg>
            {lowestFirst ? 'Lowest first' : 'Highest first'}
          </button>
        </div>

        {bySubject.length === 0 ? (
          <p className="text-sm text-slate-500 px-1">No subject has anything counted in this period.</p>
        ) : (
          <ul className="space-y-2">
            {bySubject.map(({ subject, totals }) => {
              const tone = subjectTone(subject);
              const hint = advice(totals);
              return (
                <li key={subject._id} className={`rounded-xl p-4 ${tone.tint}`}>
                  <div className="flex items-baseline justify-between gap-3 mb-2.5">
                    <h3 className="font-bold text-white truncate">{subject.name}</h3>
                    <p className="text-2xl font-bold tabular-nums text-white shrink-0 leading-none">
                      {totals.percentage === null ? '—' : totals.percentage}
                      <span className="text-sm text-slate-400">%</span>
                    </p>
                  </div>

                  <TargetBar percentage={totals.percentage} trackClass="bg-background/40" fillClass="bg-light-primary" />

                  <div className="flex items-center justify-between gap-3 mt-2.5">
                    <p className="text-xs text-slate-500">
                      {totals.attended} of {totals.counted} hrs · {totals.missed} missed
                    </p>
                    <span className={`h-7 px-2.5 rounded-full grid place-items-center text-xs font-bold shrink-0 ${hint.tone}`}>
                      {hint.text}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AttendanceReports;
