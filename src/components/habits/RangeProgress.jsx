import React from 'react';
import { colorOf, rateLabel } from '../../utils/habits';

const RANGES = [
  { id: 'WEEK', label: 'Week' },
  { id: 'MONTH', label: 'Month' },
  { id: 'YEAR', label: 'Year' }
];

const PERIOD = { WEEK: 'this week so far', MONTH: 'this month so far', YEAR: 'this year so far' };

/** What a bucket reads as out loud, so the bars carry their own numbers */
const bucketLabel = (bucket) => (bucket.due === 0
  ? `${bucket.label}: nothing due`
  : `${bucket.label}: ${bucket.rate}%, ${bucket.done} of ${bucket.due} kept`);

/**
 * One sentence of advice about the habit that is slipping.
 *
 * It is worked out from the same stretch the tiles above it describe, so the habit it
 * names is the habit they name. Advice about last week under figures about this month
 * reads like a mistake even when both are right.
 */
const suggestion = (worst, best, habits) => {
  if (!worst || worst.rate < 0) return '';
  const habit = habits.find(item => item.id === worst.habitId);
  if (worst.rate >= 80) {
    return `Everything is holding. Add one more habit if you want the challenge.`;
  }
  if (habit?.schedule === 'DAILY' && worst.rate < 50) {
    return `“${worst.name}” every day may be a lot to start with. Try 3 times a week and build up.`;
  }
  if (worst.rate < 50) {
    return `“${worst.name}” is slipping. Pick the days you can actually do it, rather than all of them.`;
  }
  return `“${worst.name}” is the one to put first${best && best.rate >= 80 ? `; “${best.name}” is looking after itself.` : '.'}`;
};

/**
 * How the habits are going over a week, a month or a year.
 *
 * The headline is a number rather than a chart, because "how am I doing" has one answer.
 * The bars under it are there for the shape — which week went wrong, which month was the
 * good one — and each bar states its own figures, so the colour is never the only thing
 * carrying the meaning.
 *
 * Every figure comes from the server. A "3 times a week" habit has to be judged a week at
 * a time and a day inside its grace period must not count as missed, and working that out
 * twice, once here and once there, is how the two end up disagreeing.
 */
function RangeProgress({ progress, range, onRange, loading, habits = [] }) {
  const buckets = progress?.buckets || [];
  const rows = progress?.habits || [];
  const tallest = Math.max(...buckets.map(bucket => (bucket.rate > 0 ? bucket.rate : 0)), 1);
  // Labelling every bar is noise; the best one is the one worth naming
  const best = buckets.reduce((top, bucket) => (bucket.rate > (top?.rate ?? -1) ? bucket : top), null);
  // The rows arrive worst first, so the ends of the list are the two habits worth naming
  const scored = rows.filter(row => row.rate >= 0);
  const worstHabit = scored[0] || null;
  const bestHabit = scored[scored.length - 1] || null;
  const advice = suggestion(worstHabit, bestHabit, habits);

  return (
    <div className="space-y-4">
      <div className="flex p-1 rounded-full bg-background-surface" role="tablist" aria-label="Range">
        {RANGES.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === range}
            onClick={() => onRange(item.id)}
            className={`flex-1 h-11 rounded-full text-sm font-bold transition-colors ${item.id === range
              ? 'bg-light-primary text-background'
              : 'text-slate-400 hover:text-slate-200'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="surface p-4" aria-label={`Habits ${PERIOD[range]}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[34px] leading-none font-bold tabular-nums text-white">
              {loading && !progress ? '—' : rateLabel(progress?.rate ?? -1)}
            </p>
            <p className="text-sm text-slate-500 mt-1.5">
              {progress && progress.due > 0
                ? `${progress.done} of ${progress.due} kept · ${PERIOD[range]}`
                : `Nothing was due ${PERIOD[range]}`}
            </p>
          </div>
          {best && best.rate >= 0 && (
            <span className="h-8 px-3 shrink-0 rounded-full grid place-items-center text-xs font-bold bg-habits-tint text-habits">
              Best: {best.label}
            </span>
          )}
        </div>

        {buckets.length > 0 && (
          <>
            {/* Bars are read bottom-up from a shared baseline; a stretch with nothing due is
                drawn as an empty slot rather than a zero, which would read as a failure. */}
            <ul className="mt-4 flex items-end gap-[3px] h-24" aria-label={`By ${range.toLowerCase()}`}>
              {buckets.map(bucket => (
                <li key={bucket.from} className="flex-1 min-w-0 h-full flex items-end">
                  <div
                    role="img"
                    aria-label={bucketLabel(bucket)}
                    title={bucketLabel(bucket)}
                    style={{ height: bucket.rate > 0 ? `${Math.max(8, (bucket.rate / tallest) * 100)}%` : undefined }}
                    className={`w-full rounded-lg ${bucket.due === 0
                      ? 'h-1 border-t-2 border-dashed border-line'
                      : bucket.rate === 0
                        ? 'h-1.5 bg-rose-500/60'
                        : 'bg-habits'}`}
                  />
                </li>
              ))}
            </ul>
            <div className="flex gap-[3px] mt-1.5" aria-hidden="true">
              {buckets.map(bucket => (
                <span key={bucket.from} className="flex-1 min-w-0 text-center text-[11px] text-slate-500 truncate">
                  {bucket.label}
                </span>
              ))}
            </div>
            {/* Said out loud when the bars cover fewer habits than the figure above them */}
            {progress?.bucketNote && (
              <p className="text-[11px] leading-relaxed text-slate-500 mt-3">{progress.bucketNote}</p>
            )}
          </>
        )}
      </section>

      {rows.length > 0 && (
        <section className="surface p-4 space-y-3" aria-label={`Each habit ${PERIOD[range]}`}>
          <h3 className="font-bold text-white">Each habit</h3>

          <ul className="space-y-2.5">
            {rows.map(row => {
              const habit = habits.find(item => item.id === row.habitId);
              const colour = colorOf(habit?.color);
              return (
                <li key={row.habitId} className="flex items-center gap-3">
                  <span className={`w-8 h-8 shrink-0 rounded-lg grid place-items-center text-sm ${colour.soft}`} aria-hidden="true">
                    {row.icon}
                  </span>
                  <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">{row.name}</span>
                  <span className="w-20 h-1.5 rounded-full bg-background-surface overflow-hidden shrink-0" aria-hidden="true">
                    {row.rate >= 0 && (
                      <span className={`block h-full rounded-full ${colour.dot}`} style={{ width: `${row.rate}%` }} />
                    )}
                  </span>
                  <span className="w-14 text-right text-xs font-bold tabular-nums text-slate-300 shrink-0">
                    {row.due === 0 ? 'none' : rateLabel(row.rate)}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* The two ends of that list, named, so the page says something rather than only showing it */}
          {scored.length > 1 && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-xl bg-emerald-500/10 px-3 py-2.5">
                <p className="text-xs text-slate-500">Going best</p>
                <p className="text-sm font-bold text-white truncate mt-0.5">{bestHabit?.name}</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 px-3 py-2.5">
                <p className="text-xs text-slate-500">Needs attention</p>
                <p className="text-sm font-bold text-white truncate mt-0.5">{worstHabit?.name}</p>
              </div>
            </div>
          )}

          {advice && <p className="text-sm text-slate-400 leading-relaxed">{advice}</p>}
        </section>
      )}
    </div>
  );
}

export default RangeProgress;
