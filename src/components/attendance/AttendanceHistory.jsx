import React, { useContext, useMemo, useState } from 'react';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import ConfirmDialog from '../ConfirmDialog';
import useDismiss from '../../hooks/useDismiss';
import { initialOf, subjectTone, tally } from '../../utils/attendance';
import { todayLocal } from '../../utils/date';

const STATUS_BADGE = {
  Present: 'bg-emerald-500/15 text-emerald-300',
  Absent: 'bg-rose-500/15 text-rose-300',
  'No Class': 'bg-slate-500/15 text-slate-300'
};
const STATUSES = ['Present', 'Absent', 'No Class'];

const dayOf = (value) => String(value).slice(0, 10);

/** "Today · Tue 10 Nov", "Yesterday · Mon 9 Nov", or "Sun 8 Nov" */
const dayHeading = (iso, today) => {
  const date = new Date(`${iso}T00:00:00`);
  const short = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const diff = Math.round((date - new Date(`${today}T00:00:00`)) / 86400000);
  if (diff === 0) return `Today · ${short}`;
  if (diff === -1) return `Yesterday · ${short}`;
  return short;
};

/** The ⋯ on a row: correct a mis-tap, or take the record out altogether */
function RowMenu({ record, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  const choose = (action) => () => {
    setOpen(false);
    action();
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={`More actions for ${record.subject?.name || 'this record'}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-10 h-10 grid place-items-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-30 w-48 overlay py-1 text-base md:text-sm">
          {STATUSES.filter(status => status !== record.status).map(status => (
            <button
              key={status}
              role="menuitem"
              onClick={choose(() => onChange(record, status))}
              className="w-full text-left px-4 py-3 md:px-3 md:py-2.5 text-slate-300 hover:bg-white/5"
            >
              Mark as {status.toLowerCase()}
            </button>
          ))}
          <button
            role="menuitem"
            onClick={choose(() => onDelete(record))}
            className="w-full text-left px-4 py-3 md:px-3 md:py-2.5 text-rose-400 hover:bg-rose-500/10"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Every class marked so far, newest first, under the day it belongs to.
 *
 * Each day says how much of it was attended, because that is the question a student is
 * actually asking when they scroll back: not "what did I tap" but "how did that week go".
 */
function AttendanceHistory() {
  const {
    attendanceRecords, subjects, updateAttendanceRecord, deleteAttendanceRecord
  } = useContext(AttendanceContext);

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const today = todayLocal();

  const days = useMemo(() => {
    const records = (attendanceRecords || [])
      .filter(record => subjectFilter === 'all' || record.subjectId === subjectFilter)
      .slice()
      .sort((a, b) => dayOf(b.date).localeCompare(dayOf(a.date)));

    const byDay = new Map();
    records.forEach(record => {
      const key = dayOf(record.date);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(record);
    });
    return [...byDay.entries()].map(([date, list]) => ({ date, records: list, totals: tally(list) }));
  }, [attendanceRecords, subjectFilter]);

  const handleChange = async (record, status) => {
    const result = await updateAttendanceRecord(record._id, { status });
    if (!result.success) setNotice(result.message);
  };

  const handleDelete = async () => {
    const record = deleting;
    setDeleting(null);
    const result = await deleteAttendanceRecord(record._id);
    if (!result.success) setNotice(result.message);
  };

  const chip = (active) => `h-10 px-4 shrink-0 rounded-full text-sm font-semibold transition-colors ${active
    ? 'bg-light-primary text-background'
    : 'bg-background-surface text-slate-300 hover:text-slate-100'}`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 -mt-1">Every class you've marked</p>

      {notice && <div className="notice notice-danger" role="alert">{notice}</div>}

      {/* The subjects themselves are the filter, so there is nothing to read before using it */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 -mx-4 px-4" role="tablist" aria-label="Filter by subject">
        <button type="button" role="tab" aria-selected={subjectFilter === 'all'} onClick={() => setSubjectFilter('all')} className={chip(subjectFilter === 'all')}>
          All
        </button>
        {(subjects || []).map(subject => {
          const active = subjectFilter === subject._id;
          const tone = subjectTone(subject);
          return (
            <button
              key={subject._id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSubjectFilter(subject._id)}
              className={`${chip(active)} inline-flex items-center gap-2`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${tone.dot}`} aria-hidden="true" />
              {subject.name}
            </button>
          );
        })}
      </div>

      {days.length === 0 ? (
        <section className="surface p-8 text-center" aria-label="Nothing marked yet">
          <h2 className="font-semibold text-white">Nothing marked yet</h2>
          <p className="text-sm text-slate-500 mt-1">
            {subjectFilter === 'all'
              ? 'Classes you record show up here, newest first.'
              : 'Nothing recorded for this subject yet.'}
          </p>
        </section>
      ) : (
        days.map(day => (
          <section key={day.date} aria-label={dayHeading(day.date, today)}>
            <div className="flex items-baseline justify-between gap-3 px-1 mb-2">
              <h2 className="text-sm font-bold text-white">{dayHeading(day.date, today)}</h2>
              <span className="text-xs text-slate-500">
                {day.totals.attended} of {day.totals.counted} {day.totals.counted === 1 ? 'hr' : 'hrs'} attended
              </span>
            </div>

            <ul className="surface divide-y divide-line overflow-hidden">
              {day.records.map(record => {
                const tone = subjectTone(record.subject || { name: '' });
                const hours = Number(record.classNumber) || 1;
                return (
                  <li key={record._id} className="flex items-center gap-3 p-3">
                    <span className={`w-9 h-9 shrink-0 rounded-full grid place-items-center text-sm font-bold ${tone.avatar}`} aria-hidden="true">
                      {initialOf(record.subject?.name)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-white truncate">
                        {record.subject?.name || 'Removed subject'}
                      </span>
                      <span className="block text-xs text-slate-500">{hours} {hours === 1 ? 'hr' : 'hrs'}</span>
                    </span>
                    <span className={`h-7 px-2.5 rounded-full grid place-items-center text-xs font-bold shrink-0 ${STATUS_BADGE[record.status] || STATUS_BADGE['No Class']}`}>
                      {record.status}
                    </span>
                    <RowMenu record={record} onChange={handleChange} onDelete={setDeleting} />
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this record?"
          message={`${deleting.subject?.name || 'This class'} on ${dayHeading(dayOf(deleting.date), today)} will be removed from your history and your percentage.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

export default AttendanceHistory;
