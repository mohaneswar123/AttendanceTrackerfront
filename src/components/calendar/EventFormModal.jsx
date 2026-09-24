import React, { useEffect, useState } from 'react';
import { defaultTimes } from '../../utils/calendarDate';

const PAST_MIDNIGHT = "End time must be later the same day. Events can't run past midnight.";

const fieldError = (message, id) => message && <p id={id} className="mt-1.5 text-sm text-rose-400">{message}</p>;

// The same rules the server checks, so mistakes show next to the field straight away
function validate({ title, date, allDay, startTime, endTime }) {
  const errors = {};
  if (!title.trim()) errors.title = 'Enter a title';
  if (!date) errors.date = 'Pick a date';
  if (!allDay) {
    if (!startTime) {
      errors.startTime = endTime ? 'Pick a start time first' : 'Pick a start time, or make it an all-day entry';
    } else if (endTime && endTime <= startTime) {
      errors.endTime = PAST_MIDNIGHT;
    }
  }
  return errors;
}

// Create or edit an entry: a bottom sheet on phones, centred on larger screens.
// `event` is the entry being edited; `initial` prefills a new one.
function EventFormModal({ event, initial, onSave, onClose }) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [type, setType] = useState(event?.type ?? 'EVENT');
  const [date, setDate] = useState(event?.date ?? initial.date);
  const [allDay, setAllDay] = useState(event?.allDay ?? Boolean(initial.allDay));
  const [startTime, setStartTime] = useState(event?.startTime ?? initial.startTime ?? '');
  const [endTime, setEndTime] = useState(event?.endTime ?? initial.endTime ?? '');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleAllDay = () => {
    if (allDay && !startTime) {
      const times = defaultTimes(9 * 60);
      setStartTime(times.startTime);
      setEndTime(times.endTime);
    }
    setAllDay(!allDay);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate({ title, date, allDay, startTime, endTime });
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setSaving(true);
    const result = await onSave({
      title: title.trim(),
      type,
      date,
      allDay,
      startTime: allDay ? null : startTime,
      endTime: allDay || !endTime ? null : endTime
    });
    setSaving(false);
    if (!result.success) setFormError(result.message);
  };

  const typeButton = (value, label, activeClass) => (
    <button
      type="button"
      role="radio"
      aria-checked={type === value}
      onClick={() => setType(value)}
      className={`py-3 md:py-2.5 rounded-xl border text-sm font-semibold transition-colors ${type === value ? activeClass : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-form-title"
        noValidate
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-xl md:rounded-lg bg-slate-900 border border-line p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 shadow-lg animate-slide-up md:animate-fade-in"
      >
        <div className="flex items-center gap-2">
          <h2 id="event-form-title" className="flex-1 text-lg font-semibold text-white">{event ? 'Edit Event' : 'Add Event'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div>
          <label htmlFor="event-title" className="label">Title</label>
          <input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="e.g. DSA exam"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'event-title-error' : undefined}
            className="input"
          />
          {fieldError(errors.title, 'event-title-error')}
        </div>

        <div>
          <span className="label">Type</span>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type">
            {typeButton('EVENT', 'Event', 'bg-primary-500/25 text-white border-primary-500/50')}
            {typeButton('REMINDER', 'Reminder', 'bg-amber-500/20 text-amber-100 border-amber-500/50')}
          </div>
          {type === 'REMINDER' && <p className="mt-1.5 text-xs text-slate-500">A reminder is a note on your calendar. No notification is sent.</p>}
        </div>

        <div>
          <label htmlFor="event-date" className="label">Date</label>
          <input
            id="event-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={Boolean(errors.date)}
            className="input [color-scheme:dark]"
          />
          {fieldError(errors.date, 'event-date-error')}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={allDay}
          onClick={toggleAllDay}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-medium text-slate-300">All day</span>
          <span className={`relative w-12 h-7 rounded-full transition-colors ${allDay ? 'bg-primary-500' : 'bg-slate-700'}`}>
            <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-primary-foreground transition-transform ${allDay ? 'translate-x-5' : ''}`} />
          </span>
        </button>

        {!allDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-start" className="label">Start</label>
              <input
                id="event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                aria-invalid={Boolean(errors.startTime)}
                aria-describedby={errors.startTime ? 'event-start-error' : undefined}
                className="input [color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="event-end" className="label">End <span className="text-slate-500 font-normal">(optional)</span></label>
              <input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                aria-invalid={Boolean(errors.endTime)}
                aria-describedby={errors.endTime ? 'event-end-error' : undefined}
                className="input [color-scheme:dark]"
              />
            </div>
            <div className="col-span-2 -mt-2">
              {fieldError(errors.startTime, 'event-start-error')}
              {fieldError(errors.endTime, 'event-end-error')}
            </div>
          </div>
        )}

        {formError && <p className="text-sm text-rose-400" role="alert">{formError}</p>}

        <div className="grid grid-cols-[1fr_1.6fr] gap-3 pt-1">
          <button type="button" onClick={onClose} className="py-3.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700">Cancel</button>
          <button type="submit" disabled={saving} className="py-3.5 bg-primary-600 hover:bg-primary-500 text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventFormModal;
