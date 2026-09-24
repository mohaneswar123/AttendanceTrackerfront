import React, { useEffect, useState } from 'react';
import { formatTime } from '../../utils/calendarDate';
import { CATEGORIES, DAYS, DAY_LONG, findOverlap } from '../../utils/timetable';

const PAST_MIDNIGHT = "End time must be later the same day. Activities can't run past midnight.";

const fieldError = (message, id) => message && <p id={id} className="mt-1.5 text-sm text-rose-400">{message}</p>;

// The same rules the server checks, so a clash shows before the request is sent.
// The server decides what is actually stored.
function validate({ title, startTime, endTime }, dayActivities, ignoreId) {
  const errors = {};
  if (!title.trim()) errors.title = 'Enter a title';
  if (!startTime) errors.startTime = 'Pick a start time';
  if (!endTime) errors.endTime = 'Pick an end time';
  if (startTime && endTime) {
    if (endTime <= startTime) {
      errors.endTime = PAST_MIDNIGHT;
    } else {
      const clash = findOverlap(dayActivities, startTime, endTime, ignoreId);
      if (clash) {
        errors.endTime = `Overlaps "${clash.title}" (${formatTime(clash.startTime)} – ${formatTime(clash.endTime)})`;
      }
    }
  }
  return errors;
}

// Add or edit one activity: a bottom sheet on phones, centred on larger screens.
// `activity` is the one being edited; `initial` prefills a new one.
// `activitiesByDay` is the mode's week, used for the overlap check on the chosen day.
function ActivityFormModal({ activity, initial, activitiesByDay, onSave, onClose }) {
  const [dayOfWeek, setDayOfWeek] = useState(activity?.dayOfWeek ?? initial.dayOfWeek);
  const [title, setTitle] = useState(activity?.title ?? '');
  const [category, setCategory] = useState(activity?.category ?? null);
  const [startTime, setStartTime] = useState(activity?.startTime ?? initial.startTime);
  const [endTime, setEndTime] = useState(activity?.endTime ?? initial.endTime);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate({ title, startTime, endTime }, activitiesByDay[dayOfWeek] || [], activity?.id);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setSaving(true);
    const result = await onSave({ dayOfWeek, title: title.trim(), category, startTime, endTime });
    setSaving(false);
    if (!result.success) setFormError(result.message);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-form-title"
        noValidate
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl bg-slate-900 border border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 shadow-2xl animate-slide-up md:animate-fade-in"
      >
        <h2 id="activity-form-title" className="text-lg font-semibold text-white">{activity ? 'Edit activity' : 'New activity'}</h2>

        <div>
          <label htmlFor="activity-title" className="label">Title</label>
          <input
            id="activity-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g. Data Structures lecture"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'activity-title-error' : undefined}
            className="input"
          />
          {fieldError(errors.title, 'activity-title-error')}
        </div>

        <div>
          <label htmlFor="activity-day" className="label">Day</label>
          <select
            id="activity-day"
            value={dayOfWeek}
            onChange={(e) => {
              setDayOfWeek(e.target.value);
              setErrors({});
            }}
            className="input"
          >
            {DAYS.map(day => <option key={day} value={day}>{DAY_LONG[day]}</option>)}
          </select>
        </div>

        <div>
          <span className="label">Category</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
            {CATEGORIES.map(option => (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={category === option.value}
                onClick={() => setCategory(option.value)}
                className={`px-3 py-2.5 md:py-2 rounded-xl border text-sm font-semibold transition-colors ${category === option.value ? option.chip : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="activity-start" className="label">Start</label>
            <input
              id="activity-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              aria-invalid={Boolean(errors.startTime)}
              aria-describedby={errors.startTime ? 'activity-start-error' : undefined}
              className="input [color-scheme:dark]"
            />
          </div>
          <div>
            <label htmlFor="activity-end" className="label">End</label>
            <input
              id="activity-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              aria-invalid={Boolean(errors.endTime)}
              aria-describedby={errors.endTime ? 'activity-end-error' : undefined}
              className="input [color-scheme:dark]"
            />
          </div>
          <div className="col-span-2 -mt-2">
            {fieldError(errors.startTime, 'activity-start-error')}
            {fieldError(errors.endTime, 'activity-end-error')}
          </div>
        </div>

        {formError && <p className="text-sm text-rose-400" role="alert">{formError}</p>}

        <div className="grid grid-cols-2 gap-2 pt-1 md:flex md:justify-end">
          <button type="button" onClick={onClose} className="px-4 py-3 md:py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-3 md:py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ActivityFormModal;
