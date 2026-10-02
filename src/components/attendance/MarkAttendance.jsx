import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import { todayLocal } from '../../utils/date';
import { dayLabel, initialOf, subjectTone } from '../../utils/attendance';
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

// Record one class: which subject, which day, what happened, how long.
function MarkAttendance({ onAddSubject }) {
  const { currentUser, subjects, addAttendanceRecord } = useContext(AttendanceContext);

  const [subjectId, setSubjectId] = useState(subjects[0]?._id || '');
  const [date, setDate] = useState(todayLocal);
  const [status, setStatus] = useState('Present');
  const [classNumber, setClassNumber] = useState(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!subjects.some(s => s._id === subjectId)) setSubjectId(subjects[0]?._id || '');
  }, [subjects, subjectId]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return setMessage({ text: 'Sign in to record attendance.', ok: false });
    const subject = subjects.find(s => s._id === subjectId);
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

  return (
    <form onSubmit={handleSubmit} className="surface p-4 space-y-4">
      <h2 className="font-semibold text-white">Mark a class</h2>

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
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Subject">
        {subjects.map(subject => {
          const chosen = subject._id === subjectId;
          const tone = subjectTone(subject.name);
          return (
            <button
              key={subject._id}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => setSubjectId(subject._id)}
              className={`h-10 px-3.5 rounded-full border text-sm font-medium transition-colors flex items-center gap-2 ${chosen
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                : 'border-line bg-background-surface text-slate-300 hover:text-slate-100'}`}
            >
              {chosen && <span className={`w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold ${tone.avatar}`}>{initialOf(subject.name)}</span>}
              {subject.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onAddSubject}
          aria-label="Add a subject"
          className="w-10 h-10 rounded-full border border-dashed border-line text-slate-500 grid place-items-center hover:text-slate-300"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <label className="flex items-center gap-3 h-12 px-3 rounded-xl bg-background-surface cursor-pointer">
        <span className="text-slate-500">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
          </svg>
        </span>
        <span className="flex-1 text-sm text-slate-200">{dayLabel(date, todayLocal())}</span>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          aria-label="Date"
          className="w-6 bg-transparent text-transparent outline-none cursor-pointer"
        />
      </label>

      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="What happened">
        {STATUSES.map(option => {
          const chosen = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => setStatus(option.value)}
              className={`h-[74px] rounded-xl border flex flex-col items-center justify-center gap-1.5 text-sm font-medium transition-colors ${chosen
                ? option.on
                : 'border-line bg-background-surface text-slate-300 hover:text-slate-100'}`}
            >
              <span className={`w-6 h-6 rounded-full grid place-items-center ${chosen ? option.dot : 'bg-background-paper text-slate-500'}`}>
                {option.icon}
              </span>
              {option.value}
            </button>
          );
        })}
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
              className={`w-12 h-9 rounded-lg text-sm font-medium transition-colors ${classNumber === hours
                ? 'bg-background-paper text-white shadow-sm'
                : 'text-slate-500'}`}
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving || !currentUser} className="btn btn-primary w-full h-12 text-[15px]">
        {saving ? 'Saving…' : 'Save attendance'}
      </button>
    </form>
  );
}

export default MarkAttendance;
