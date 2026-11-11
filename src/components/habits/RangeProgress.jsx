import React from 'react';
import { rateLabel } from '../../utils/habits';

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
function RangeProgress({ progress, range, onRange, loading }) {
  const buckets = progress?.buckets || [];
  const tallest = Math.max(...buckets.map(bucket => (bucket.rate > 0 ? bucket.rate : 0)), 1);
  // Labelling every bar is noise; the best one is the one worth naming
  const best = buckets.reduce((top, bucket) => (bucket.rate > (top?.rate ?? -1) ? bucket : top), null);

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
            <p className="text-sm text-slate-400 mt-1.5">
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
                <span key={bucket.from} className="flex-1 min-w-0 text-center text-xs text-slate-400 truncate">
                  {bucket.label}
                </span>
              ))}
            </div>
            {/* Said out loud when the bars cover fewer habits than the figure above them */}
            {progress?.bucketNote && (
              <p className="text-xs leading-relaxed text-slate-400 mt-3">{progress.bucketNote}</p>
            )}
          </>
        )}
      </section>

    </div>
  );
}

export default RangeProgress;
