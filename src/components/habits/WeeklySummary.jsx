import React from 'react';
import { rateLabel, shortDay } from '../../utils/habits';

/**
 * Last week in review. It leads with the habit that went well, because a summary that
 * only lists what went wrong is one a student stops opening.
 */
function WeeklySummary({ summary }) {
  if (!summary) return null;

  const nothingToReport = summary.overallRate < 0;

  return (
    <section className="surface p-4 space-y-3" aria-label="Last week in review">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="section-title">Last week</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {shortDay(summary.weekStart)} – {shortDay(summary.weekEnd)}
          </p>
        </div>
        {!nothingToReport && (
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-white leading-none">{rateLabel(summary.overallRate)}</p>
            <p className="text-xs text-slate-500 mt-1">kept</p>
          </div>
        )}
      </div>

      {!nothingToReport && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-background-surface px-3 py-2.5">
            <p className="text-xs text-slate-500">Went best</p>
            <p className="text-sm font-semibold text-white truncate mt-0.5">{summary.bestName || '—'}</p>
            {summary.bestName && <p className="text-xs text-emerald-500 mt-0.5">{summary.bestRate}% kept</p>}
          </div>
          <div className="rounded-xl bg-background-surface px-3 py-2.5">
            <p className="text-xs text-slate-500">Slipped</p>
            <p className="text-sm font-semibold text-white truncate mt-0.5">{summary.slippedName || 'Nothing'}</p>
            {summary.slippedName && <p className="text-xs text-amber-500 mt-0.5">{summary.slippedRate}% kept</p>}
          </div>
        </div>
      )}

      <p className="text-sm text-slate-400">{summary.suggestion}</p>
    </section>
  );
}

export default WeeklySummary;
