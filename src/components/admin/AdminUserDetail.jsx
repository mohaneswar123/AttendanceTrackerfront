import React, { useState } from 'react';
import AdminActivityLog from './AdminActivityLog';
import {
  STATE_BADGE, STATE_LABEL, accessState, accessSummary, formatDate
} from '../../utils/admin';

const PRESETS = [7, 30, 90, 180];

// One account: who it is, what access it has, the actions, and its own history.
function AdminUserDetail({
  user, subjects, attendance, history, busy,
  onActivate, onExtend, onDeactivate, onDelete, onSetPassword
}) {
  const [days, setDays] = useState(30);
  const [password, setPassword] = useState('');
  const state = accessState(user);

  const stats = subjects.map(subject => {
    const records = attendance.filter(record =>
      (record.subject?._id || record.subjectId) === subject._id);
    let attended = 0, counted = 0, missed = 0;
    records.forEach(record => {
      const hours = Number(record.classNumber) || 1;
      if (record.status === 'Present') attended += hours;
      else if (record.status === 'Absent') missed += hours;
      if (record.status !== 'No Class') counted += hours;
    });
    return {
      ...subject,
      attended,
      missed,
      percentage: counted > 0 ? Math.round((attended / counted) * 100) : 0
    };
  });

  const tone = (pct) => (pct >= 75 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400');

  return (
    <div className="space-y-4">
      <section className="surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{user.username}</h2>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>
          <span className={`badge ${STATE_BADGE[state]} shrink-0`}>{STATE_LABEL[state]}</span>
        </div>

        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Access</dt>
            <dd className="text-slate-200 mt-0.5">{accessSummary(user)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Paid till</dt>
            <dd className="text-slate-200 mt-0.5">{formatDate(user.paidTill)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Subjects</dt>
            <dd className="text-slate-200 mt-0.5">{subjects.length}</dd>
          </div>
        </dl>
      </section>

      <section className="surface p-5 space-y-4" aria-label="Access">
        <h2 className="section-title">Access</h2>

        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="admin-days" className="label">Days</label>
            <input
              id="admin-days"
              type="number"
              min="0"
              value={days}
              onChange={(e) => setDays(Math.max(0, Number(e.target.value)))}
              className="input w-24 text-center tabular-nums"
            />
          </div>
          <div className="segmented" role="group" aria-label="Common lengths">
            {PRESETS.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setDays(preset)}
                aria-checked={days === preset}
                role="radio"
                className="segmented-item px-2.5"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => onExtend(days)} disabled={busy} className="btn btn-primary">
            Extend by {days} {days === 1 ? 'day' : 'days'}
          </button>
          <button onClick={() => onActivate(days)} disabled={busy} className="btn btn-secondary">
            Set {days} {days === 1 ? 'day' : 'days'} from today
          </button>
          {user.active && (
            <button onClick={onDeactivate} disabled={busy} className="btn btn-ghost text-amber-400 hover:bg-amber-500/10">
              Deactivate
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Extending keeps the days still left; setting from today replaces them.
        </p>
      </section>

      <section className="surface p-5 space-y-3" aria-label="Password">
        <h2 className="section-title">Password</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary password"
            aria-label="New password"
            autoComplete="off"
            className="input"
          />
          <button
            onClick={() => onSetPassword(password, () => setPassword(''))}
            disabled={busy || !password.trim()}
            className="btn btn-secondary shrink-0"
          >
            Set
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Passwords are stored hashed and cannot be read back. Set a temporary one and send it to {user.email}.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <section className="surface overflow-hidden" aria-label="Attendance by subject">
          <div className="flex items-center h-11 px-4 border-b border-line">
            <h2 className="section-title">Attendance by subject</h2>
          </div>
          {stats.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No subjects yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {stats.map(subject => (
                <li key={subject._id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-slate-100 truncate">{subject.name}</span>
                    <span className={`text-sm font-semibold tabular-nums shrink-0 ${tone(subject.percentage)}`}>
                      {subject.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {subject.attended}h present · {subject.missed}h absent
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <AdminActivityLog
          entries={history}
          title="History for this account"
          emptyMessage="No admin actions recorded."
          showTarget={false}
        />
      </div>

      <section className="surface p-5 border-rose-500/25" aria-label="Delete account">
        <h2 className="section-title text-rose-400">Delete account</h2>
        <p className="text-sm text-slate-400 mt-1 mb-4">
          Removes the account and everything it owns: subjects, attendance, tasks, calendar,
          timetable and focus history. This cannot be undone. The audit log keeps a record.
        </p>
        <button onClick={onDelete} disabled={busy} className="btn btn-danger">Delete account</button>
      </section>
    </div>
  );
}

export default AdminUserDetail;
