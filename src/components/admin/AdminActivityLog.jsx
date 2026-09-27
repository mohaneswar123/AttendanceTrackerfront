import React from 'react';
import { ACTION_BADGE, ACTION_LABEL, formatMoment } from '../../utils/admin';

// What admins have done. Entries are kept even after the account is deleted, which is
// the case the log exists for, so the email shown is the one recorded at the time.
function AdminActivityLog({ entries, title = 'Recent admin activity', emptyMessage = 'Nothing yet.', showTarget = true }) {
  return (
    <section className="surface overflow-hidden" aria-label={title}>
      <div className="flex items-center h-11 px-4 border-b border-line">
        <h2 className="section-title">{title}</h2>
      </div>

      {entries.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-line max-h-80 overflow-y-auto custom-scrollbar">
          {entries.map(entry => (
            <li key={entry.id} className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={`badge ${ACTION_BADGE[entry.action] || 'badge-neutral'} shrink-0`}>
                  {ACTION_LABEL[entry.action] || entry.action}
                </span>
                {showTarget && (
                  <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">{entry.targetEmail}</span>
                )}
                <span className={`text-xs text-slate-500 shrink-0 ${showTarget ? '' : 'ml-auto'}`}>
                  {formatMoment(entry.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {entry.detail} · by {entry.adminEmail}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminActivityLog;
