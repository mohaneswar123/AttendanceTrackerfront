import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import { todayLocal } from '../../utils/date';
import { dayLabel, initialOf, subjectTone, tally } from '../../utils/attendance';
import ConfirmDialog from '../ConfirmDialog';
import { CheckIcon, CloseIcon, PlusIcon } from '../icons';

const STATUSES = [
  {
    value: 'Present',
    icon: <CheckIcon className="w-4 h-4" />,
    on: 'bg-emerald-500/10 border-emerald-500 text-emerald-300',
    dot: 'bg-emerald-500 text-white'
  },
  {
    value: 'Absent',
    icon: <CloseIcon className="w-4 h-4" />,
    on: 'bg-rose-500/10 border-rose-500 text-rose-300',
    dot: 'bg-rose-500 text-white'
  },
  {
    value: 'No class',
    stored: 'No Class',
    icon: <span className="block w-3 h-0.5 rounded bg-current" />,
    on: 'bg-background-surface border-slate-400 text-slate-400',
    dot: 'bg-slate-400 text-white'
  }
];

const BADGE = {
  Present: 'bg-emerald-500/15 text-emerald-300',
  Absent: 'bg-rose-500/15 text-rose-300',
  'No Class': 'bg-slate-500/15 text-slate-300'
};

/**
 * What saving this would do to the subject's percentage.
 *
 * It is worked out from the records already in hand rather than asked of the server,
 * because it has to update as the buttons are pressed, before anything is saved.
 * "No class" never counts, so it moves nothing and says nothing.
 */
const projection = (records, subject, status, hours) => {
  if (!subject || status === 'No class') return null;
  const mine = records.filter(record => record.subjectId === subject._id);
  const now = tally(mine);
  const next = tally([...mine, { status: status === 'Absent' ? 'Absent' : 'Present', classNumber: hours }]);
  if (next.percentage === null) return null;
  if (now.percentage === null) return `${subject.name} starts at ${next.percentage}%.`;
  if (now.percentage === next.percentage) return `${subject.name} stays at ${next.percentage}%.`;
  return `${subject.name} goes from ${now.percentage}% to ${next.percentage}%.`;
};

// Record one class: which subject, which day, what happened, how long.
function MarkAttendance({ onAddSubject }) {
  const {
    currentUser, subjects, attendanceRecords, addAttendanceRecord, deleteAttendanceRecord
  } = useContext(AttendanceContext);

  const [subjectId, setSubjectId] = useState(subjects[0]?._id || '');
  const [date, setDate] = useState(todayLocal);
  const [status, setStatus] = useState('Present');
  const [classNumber, setClassNumber] = useState(1);
  const [saving, setSaving] = useState(false);
  const [undoing, setUndoing] = useState(null);  // the record waiting for confirmation
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const today = todayLocal();

  useEffect(() => {
    if (!subjects.some(s => s._id === subjectId)) setSubjectId(subjects[0]?._id || '');
  }, [subjects, subjectId]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const subject = subjects.find(s => s._id === subjectId) || null;
  const ahead = useMemo(
    () => projection(attendanceRecords, subject, status, classNumber),
    [attendanceRecords, subject, status, classNumber]
  );

  // What is already down for the day being recorded, newest first
  const marked = useMemo(() => attendanceRecords
    .filter(record => String(record.date).slice(0, 10) === date)
    .slice()
    .reverse(), [attendanceRecords, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return setMessage({ text: 'Sign in to record attendance.', ok: false });
    if (!subject) return setMessage({ text: 'Add a subject first.', ok: false });

    const stored = STATUSES.find(s => s.value === status)?.stored || status;
    setSaving(true);
    const result = await addAttendanceRecord({ subjectId, date, status: stored, classNumber });
    setSaving(false);

    if (result.success) {
      setMessage({ text: `Saved ${subject.name} as ${stored.toLowerCase()}.`, ok: true });
      setStatus('Present');
    } else {
      setMessage({ text: result.message || 'Could not save that record.', ok: false });
    }
  };

  const handleUndo = async () => {
    const record = undoing;
    setUndoing(null);
    setBusy(record._id);
    const result = await deleteAttendanceRecord(record._id);
    setBusy(null);
    setMessage(result.success
      ? { text: `${record.subject?.name || 'That class'} is no longer marked.`, ok: true }
      : { text: result.message || 'Could not undo that.', ok: false });
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="surface p-4 space-y-4">
        {!currentUser && (
          <div className="notice notice-warning">
            <span className="flex-1">You are not signed in, so nothing is saved.</span>
            <Link to="/login" className="font-medium underline underline-offset-2">Sign in</Link>
          </div>
        )}

        {message && (
          <div className={`notice ${message.ok ? 'notice-success' : 'notice-danger'}`} role="status">{message.text}</div>
        )}

        {/* Subjects as chips, with a + that goes where they are managed */}
        <div>
          <p className="label mb-2" id="which-class">Which class?</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="which-class">
            {subjects.map(item => {
              const chosen = item._id === subjectId;
              const tone = subjectTone(item);
              return (
                <button
                  key={item._id}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  onClick={() => setSubjectId(item._id)}
                  className={`h-11 pl-2 pr-4 rounded-full text-sm font-semibold transition-colors flex items-center gap-2.5 ${chosen
                    ? 'bg-light-primary text-background'
                    : 'bg-background-surface text-slate-300 hover:text-slate-100'}`}
                >
                  <span className={`w-6 h-6 rounded-full shrink-0 ${tone.dot}`} aria-hidden="true" />
                  {item.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onAddSubject}
              aria-label="Add a subject"
              className="w-11 h-11 rounded-full border border-dashed border-line text-slate-500 grid place-items-center hover:text-slate-300"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The day. Tapping anywhere on the row opens the picker; "Change" says so. */}
        <label className="flex items-center gap-3 h-12 px-3 rounded-xl bg-background-surface cursor-pointer">
          <span className="text-slate-500">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
            </svg>
          </span>
          <span className="flex-1 text-sm font-medium text-slate-200">{dayLabel(date, today)}</span>
          <span className="text-sm font-semibold text-attendance underline underline-offset-2" aria-hidden="true">Change</span>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            aria-label="Date"
            className="w-0 bg-transparent text-transparent outline-none cursor-pointer"
          />
        </label>

        <div>
          <p className="label mb-2" id="how-did-it-go">How did it go?</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="how-did-it-go">
            {STATUSES.map(option => {
              const chosen = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  onClick={() => setStatus(option.value)}
                  className={`h-[84px] rounded-xl border flex flex-col items-center justify-center gap-2 text-sm font-semibold transition-colors ${chosen
                    ? option.on
                    : 'border-line bg-background-surface text-slate-300 hover:text-slate-100'}`}
                >
                  <span className={`w-7 h-7 rounded-full grid place-items-center ${chosen ? option.dot : 'bg-background-paper text-slate-500'}`}>
                    {option.icon}
                  </span>
                  {option.value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-400">Class length</span>
          <div className="flex p-1 rounded-xl bg-background-surface" role="radiogroup" aria-label="Class length">
            {[1, 2, 3].map(hours => (
              <button
                key={hours}
                type="button"
                role="radio"
                aria-checked={classNumber === hours}
                onClick={() => setClassNumber(hours)}
                className={`w-14 h-11 rounded-lg text-sm font-semibold transition-colors ${classNumber === hours
                  ? 'bg-light-primary text-background'
                  : 'text-slate-500'}`}
              >
                {hours} hr
              </button>
            ))}
          </div>
        </div>

        <div>
          {/* The one dark thing on the page, so the eye lands on it */}
          <button
            type="submit"
            disabled={saving || !currentUser || !subject}
            className="btn w-full h-12 text-[15px] bg-light-primary text-background hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : subject ? `Save ${subject.name}` : 'Save attendance'}
          </button>
          {/* What this will do to the percentage, before it is done */}
          {ahead && <p className="text-xs text-slate-500 text-center mt-2.5">{ahead}</p>}
        </div>
      </form>

      {/* What is already down for this day, so the same class is not recorded twice */}
      <section aria-label="Marked today">
        <div className="flex items-baseline justify-between gap-3 px-1 mb-2">
          <h2 className="font-semibold text-white">
            {date === today ? 'Marked today' : `Marked on ${dayLabel(date, today)}`}
          </h2>
          <span className="text-xs text-slate-500">
            {marked.length} of {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
          </span>
        </div>

        {marked.length === 0 ? (
          <p className="text-sm text-slate-500 px-1">Nothing recorded for this day yet.</p>
        ) : (
          <ul className="space-y-2">
            {marked.map(record => {
              const tone = subjectTone(record.subject || { name: '' });
              const hours = Number(record.classNumber) || 1;
              return (
                <li key={record._id} className={`flex items-center gap-3 p-3 rounded-xl ${tone.tint}`}>
                  <span className={`w-9 h-9 shrink-0 rounded-full grid place-items-center text-sm font-bold ${tone.avatar}`} aria-hidden="true">
                    {initialOf(record.subject?.name)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-white truncate">
                      {record.subject?.name || 'Removed subject'}
                    </span>
                    <span className="block text-xs text-slate-500">{hours} {hours === 1 ? 'hr' : 'hrs'}</span>
                  </span>
                  <span className={`h-7 px-2.5 rounded-full grid place-items-center text-xs font-bold shrink-0 ${BADGE[record.status] || BADGE['No Class']}`}>
                    {record.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUndoing(record)}
                    disabled={busy === record._id}
                    className="h-11 px-2 -mr-2 text-sm font-semibold text-slate-400 hover:text-rose-400 underline underline-offset-2 shrink-0 disabled:opacity-50"
                  >
                    {busy === record._id ? '…' : 'Undo'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {undoing && (
        <ConfirmDialog
          title="Undo this record?"
          message={`${undoing.subject?.name || 'This class'} on ${dayLabel(String(undoing.date).slice(0, 10), today)} will be removed, and its hours leave your percentage.`}
          confirmLabel="Undo"
          danger
          onConfirm={handleUndo}
          onCancel={() => setUndoing(null)}
        />
      )}
    </div>
  );
}

export default MarkAttendance;
