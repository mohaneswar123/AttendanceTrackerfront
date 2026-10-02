import React from 'react';
import { TARGET, canMiss, needToAttend } from '../../utils/attendance';

// The headline card: where you stand, and what it would take to move.
function AttendanceSummary({ totals, todayCount }) {
  const { percentage, attended, missed, counted } = totals;
  const onTrack = percentage !== null && percentage >= TARGET;
  const spare = canMiss(totals);
  const needed = needToAttend(totals);

  return (
    <section className="surface p-4 space-y-3" aria-label="Overall attendance">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Overall attendance</p>
          <p className="text-[34px] leading-10 font-bold tracking-tight text-white">
            {percentage === null ? '—' : <>{percentage}<span className="text-2xl font-semibold text-slate-400">%</span></>}
          </p>
        </div>
        {percentage !== null && (
          <span className={`badge shrink-0 ${onTrack ? 'badge-success' : 'badge-danger'}`}>
            {onTrack ? 'On track' : 'Below target'}
          </span>
        )}
      </div>

      {/* The bar, with a mark where the target sits */}
      <div>
        <div className="relative h-2 rounded-full bg-background-surface overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${onTrack ? 'bg-primary-600' : 'bg-rose-500'}`}
            style={{ width: `${percentage === null ? 0 : Math.min(100, percentage)}%` }}
          />
        </div>
        <div className="relative h-4" aria-hidden="true">
          <span className="absolute -top-2 w-px h-3 bg-slate-400" style={{ left: `${TARGET}%` }} />
          <span className="absolute top-1 text-[11px] text-slate-500 -translate-x-1/2" style={{ left: `${TARGET}%` }}>
            {TARGET}% needed
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-400 pt-1">
        {counted === 0 ? (
          'Record a class and your percentage appears here.'
        ) : onTrack ? (
          <>You can miss <strong className="text-white font-semibold">{spare} more {spare === 1 ? 'class' : 'classes'}</strong> and still stay above {TARGET}%.</>
        ) : (
          <>Attend <strong className="text-white font-semibold">{needed} more {needed === 1 ? 'class' : 'classes'}</strong> in a row to get back above {TARGET}%.</>
        )}
      </p>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { value: attended, label: 'Attended' },
          { value: missed, label: 'Missed' },
          { value: todayCount, label: 'Today' }
        ].map(tile => (
          <div key={tile.label} className="rounded-xl bg-background-surface px-3 py-2.5">
            <p className="text-xl font-bold tabular-nums text-white">{tile.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tile.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AttendanceSummary;
