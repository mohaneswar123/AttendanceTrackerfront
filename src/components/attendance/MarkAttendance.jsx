import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import { todayLocal } from '../../utils/date';

const STATUSES = [
  { value: 'Present', selected: 'bg-emerald-500 text-primary-foreground border-emerald-500' },
  { value: 'Absent', selected: 'bg-rose-500 text-primary-foreground border-rose-500' },
  { value: 'No Class', selected: 'bg-slate-600 text-white border-slate-600' }
];

const hoursLabel = (hours) => `${hours} ${Number(hours) === 1 ? 'hr' : 'hrs'}`;

const choice = (isSelected, selectedClass) =>
  `h-11 md:h-9 rounded-lg border text-sm font-medium transition-colors ${isSelected
    ? selectedClass
    : 'bg-white/5 text-slate-300 border-line hover:bg-white/10'}`;

// Record one class, with the last few records beside it
function MarkAttendance({ onViewHistory, onAddSubject }) {
  const { currentUser, subjects, attendanceRecords, addAttendanceRecord } = useContext(AttendanceContext);

  const [formData, setFormData] = useState({
    subjectId: subjects[0]?._id || '',
    date: todayLocal(),
    status: 'Present',
    classNumber: 1 // class length in hours
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Keep a valid subject selected as subjects load or get deleted
  useEffect(() => {
    if (!subjects.some(s => s._id === formData.subjectId)) {
      setFormData(prev => ({ ...prev, subjectId: subjects[0]?._id || '' }));
    }
  }, [subjects, formData.subjectId]);

  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentUser) {
      setMessage({ text: 'Sign in to record attendance.', type: 'error' });
      return;
    }
    const subject = subjects.find(s => s._id === formData.subjectId);
    if (!subject) {
      setMessage({ text: 'Add a subject first.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const result = await addAttendanceRecord(formData);
    setIsSubmitting(false);

    if (result.success) {
      setMessage({ text: `Recorded ${subject.name} as ${formData.status.toLowerCase()}.`, type: 'success' });
      setFormData(prev => ({ ...prev, status: 'Present' }));
    } else {
      setMessage({ text: result.message || 'Could not save that record.', type: 'error' });
    }
  };

  const recent = attendanceRecords.slice().reverse().slice(0, 6);

  // The same weighting the reports use: counted in hours, and "No Class" counts for nothing
  const summary = useMemo(() => {
    let attended = 0, counted = 0, today = 0;
    const isToday = todayLocal();
    attendanceRecords.forEach(record => {
      const hours = Number(record.classNumber) || 1;
      if (record.status === 'Present') attended += hours;
      if (record.status !== 'No Class') counted += hours;
      if (record.date === isToday) today += 1;
    });
    return {
      percentage: counted > 0 ? Math.round((attended / counted) * 100) : null,
      today,
      subjects: subjects.length
    };
  }, [attendanceRecords, subjects]);

  const percentageTone = summary.percentage === null ? 'text-slate-500'
    : summary.percentage >= 75 ? 'text-emerald-400'
      : summary.percentage >= 60 ? 'text-amber-400' : 'text-rose-400';

  const stat = (label, value, tone = 'text-white') => (
    <div className="surface p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 tabular-nums ${tone}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {stat('Overall', summary.percentage === null ? '—' : `${summary.percentage}%`, percentageTone)}
        {stat('Recorded today', summary.today)}
        {stat('Subjects', summary.subjects)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <div className="surface p-5 lg:col-span-2 space-y-5">
        {!currentUser && (
          <div className="notice notice-warning">
            <span className="flex-1">You are not signed in, so nothing is saved.</span>
            <Link to="/login" className="font-medium underline underline-offset-2">Sign in</Link>
          </div>
        )}

        {currentUser && subjects.length === 0 && (
          <div className="notice notice-info">
            <span className="flex-1">You have no subjects yet.</span>
            <button type="button" onClick={onAddSubject} className="font-medium underline underline-offset-2">Add one</button>
          </div>
        )}

        {message.text && (
          <div className={`notice ${message.type === 'success' ? 'notice-success' : 'notice-danger'}`} role="status">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="attendance-subject" className="label">Subject</label>
              <select
                id="attendance-subject"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                className="input"
                disabled={!currentUser || subjects.length === 0}
              >
                {subjects.length === 0 && <option value="">No subjects</option>}
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="attendance-date" className="label">Date</label>
              <input
                id="attendance-date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="input [color-scheme:dark]"
              />
            </div>

            <div>
              <span className="label">Status</span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Status">
                {STATUSES.map(status => (
                  <button
                    key={status.value}
                    type="button"
                    role="radio"
                    aria-checked={formData.status === status.value}
                    onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                    className={choice(formData.status === status.value, status.selected)}
                  >
                    {status.value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label">Class length</span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Class length in hours">
                {[1, 2, 3].map(num => (
                  <button
                    key={num}
                    type="button"
                    role="radio"
                    aria-checked={formData.classNumber === num}
                    onClick={() => setFormData(prev => ({ ...prev, classNumber: num }))}
                    className={choice(formData.classNumber === num, 'bg-primary-600 text-primary-foreground border-primary-600')}
                  >
                    {num} {num === 1 ? 'hour' : 'hours'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || !currentUser} className="btn btn-primary w-full md:w-auto md:px-6">
            {isSubmitting ? 'Saving…' : 'Record attendance'}
          </button>
        </form>
      </div>

      <aside className="surface p-5" aria-label="Recent records">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent</h2>
          <button type="button" onClick={onViewHistory} className="text-xs font-medium text-primary-300 hover:text-primary-200">
            View all
          </button>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y divide-line -my-2">
            {recent.map(record => (
              <li key={record._id} className="flex items-center gap-3 py-2.5">
                <span className={`w-6 h-6 shrink-0 rounded text-[11px] font-semibold flex items-center justify-center ${record.status === 'Present' ? 'bg-emerald-500/15 text-emerald-400'
                  : record.status === 'Absent' ? 'bg-rose-500/15 text-rose-400' : 'bg-white/5 text-slate-400'}`}>
                  {record.status === 'Present' ? 'P' : record.status === 'Absent' ? 'A' : '—'}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-slate-200 truncate">{record.subject?.name || 'Unknown subject'}</span>
                  <span className="block text-xs text-slate-500">{record.date} · {hoursLabel(record.classNumber)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        </aside>
      </div>
    </div>
  );
}

export default MarkAttendance;
