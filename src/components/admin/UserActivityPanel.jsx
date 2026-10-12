import React from 'react';
import {
  FEATURE_LABEL, FEATURE_ORDER, USER_ACTION_BADGE, USER_ACTION_LABEL, formatMoment, totalActions
} from '../../utils/admin';

// What the student has been doing, as the log records it: which part of the app, and
// whether something was added, changed or removed. It deliberately holds nothing about
// what they wrote, so there is never a title or a note to show here.
function UserActivityPanel({ activity, loading }) {
  if (loading) {
    return (
      <section className="surface p-6 text-center" aria-label="What this account has been doing">
        <p className="text-sm text-slate-500">Loading activity…</p>
      </section>
    );
  }

  const counts = activity?.counts || {};
  const entries = activity?.entries || [];
  const total = totalActions(counts);
  const used = FEATURE_ORDER.filter(feature => counts[feature]);

  return (
    <section className="surface overflow-hidden" aria-label="What this account has been doing">
      <div className="flex items-center justify-between gap-3 h-11 px-4 border-b border-line">
        <h2 className="section-title">What they have been doing</h2>
        <span className="text-xs text-slate-500">
          {total === 0 ? 'nothing on record' : `${total} ${total === 1 ? 'action' : 'actions'}`}
          {activity?.keptForDays ? ` · last ${activity.keptForDays} days` : ''}
        </span>
      </div>

      {total === 0 ? (
        <p className="p-6 text-center text-sm text-slate-500">
          Nothing on record yet. Only what happens from now on is logged.
        </p>
      ) : (
        <>
          {/* The totals first: the quickest answer to "is this account being used" */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border-b border-line">
            {used.map(feature => {
              const perAction = counts[feature];
              const featureTotal = Object.values(perAction).reduce((a, b) => a + b, 0);
              return (
                <div key={feature} className="rounded-xl bg-background-surface px-3 py-2.5">
                  <p className="text-xl font-bold tabular-nums text-white">{featureTotal}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{FEATURE_LABEL[feature]}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {['CREATE', 'UPDATE', 'DELETE']
                      .filter(action => perAction[action])
                      .map(action => `${perAction[action]} ${USER_ACTION_LABEL[action].toLowerCase()}`)
                      .join(' · ')}
                  </p>
                </div>
              );
            })}
          </div>

          <ul className="divide-y divide-line max-h-80 overflow-y-auto custom-scrollbar">
            {entries.map(entry => (
              <li key={entry.id} className="flex items-center gap-2 px-4 py-2.5">
                <span className={`badge ${USER_ACTION_BADGE[entry.action] || 'badge-neutral'} shrink-0`}>
                  {USER_ACTION_LABEL[entry.action] || entry.action}
                </span>
                <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">
                  {FEATURE_LABEL[entry.feature] || entry.feature}
                </span>
                {entry.byAdmin && <span className="badge badge-warning shrink-0">by an admin</span>}
                <span className="text-xs text-slate-500 shrink-0">{formatMoment(entry.at)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default UserActivityPanel;
