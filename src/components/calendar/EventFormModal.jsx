import React, { useEffect, useState } from 'react';
import {
  CATEGORIES, CATEGORY_NAMES, defaultTimes, fromMinutes, shortDate, shortDuration, toMinutes
} from '../../utils/calendarDate';
import { todayLocal } from '../../utils/date';
import { BellIcon, CalendarIcon, CloseIcon, MinusIcon, PlusIcon } from '../icons';

const PAST_MIDNIGHT = "End time must be later the same day. Events can't run past midnight.";
const STEP = 15;

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

const pad = (n) => String(n).padStart(2, '0');
const isoFrom = (offset) => {
  const date = new Date(`${todayLocal()}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * A time, changed by the quarter hour rather than typed.
 *
 * A time field on a phone is a keyboard and a colon; two big buttons are neither, and a
 * calendar entry is almost always on a quarter hour anyway.
 */
function TimeStepper({ label, value, onChange, hint }) {
  const step = (delta) => {
    const minutes = toMinutes(value || '09:00') + delta;
    onChange(fromMinutes(Math.min(23 * 60 + 45, Math.max(0, minutes))));
  };

  return (
    <div className="flex items-center gap-3 h-14 px-4 rounded-xl bg-background-surface">
      <span className="flex-1 min-w-0">
        <span className="font-bold text-white">{label}</span>
        {hint && <span className="text-slate-400 font-normal"> · {hint}</span>}
      </span>
      <button
        type="button"
        onClick={() => step(-STEP)}
        aria-label={`${label} 15 minutes earlier`}
        className="w-10 h-10 shrink-0 rounded-full grid place-items-center bg-background-paper text-slate-300 hover:text-white"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      <span className="w-14 text-center text-lg font-bold tabular-nums text-white">{value || '--:--'}</span>
      <button
        type="button"
        onClick={() => step(STEP)}
        aria-label={`${label} 15 minutes later`}
        className="w-10 h-10 shrink-0 rounded-full grid place-items-center bg-background-paper text-slate-300 hover:text-white"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// Create or edit an entry: a bottom sheet on phones, centred on larger screens.
// `event` is the entry being edited; `initial` prefills a new one.
function EventFormModal({ event, initial, onSave, onClose }) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [type, setType] = useState(event?.type ?? 'EVENT');
  const [category, setCategory] = useState(event?.category ?? 'CLASS');
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
      category,
      date,
      allDay,
      startTime: allDay ? null : startTime,
      endTime: allDay || !endTime ? null : endTime
    });
    setSaving(false);
    if (!result.success) setFormError(result.message);
  };

  const chip = (active) => `h-11 px-4 rounded-full text-sm font-bold transition-colors ${active
    ? 'bg-light-primary text-background'
    : 'bg-background-surface text-slate-300 hover:text-white'}`;

  const length = shortDuration({ allDay, startTime, endTime });

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-form-title"
        noValidate
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl overlay p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 animate-slide-up md:animate-fade-in"
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto md:hidden" aria-hidden="true" />

        <div className="flex items-center justify-between gap-3">
          <h2 id="event-form-title" className="text-2xl font-bold text-white">
            {event ? 'Edit entry' : 'New event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 shrink-0 rounded-full grid place-items-center bg-background-surface text-slate-400 hover:text-white"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {formError && <div className="notice notice-danger" role="alert">{formError}</div>}

        <div>
          <label htmlFor="event-title" className="label">Title</label>
          <input
            id="event-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. DSA exam"
            maxLength={200}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'event-title-error' : undefined}
            className="input"
          />
          {fieldError(errors.title, 'event-title-error')}
        </div>

        {/* An entry is a thing that happens, or a nudge on the day. Both are dated. */}
        <div className="flex p-1 rounded-full bg-background-surface" role="radiogroup" aria-label="Kind">
          {[['EVENT', 'Event', CalendarIcon], ['REMINDER', 'Reminder', BellIcon]].map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => setType(value)}
              className={`flex-1 h-11 rounded-full inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors ${type === value
                ? 'bg-background-paper text-white'
                : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div>
          <span className="label">Category</span>
          <div className="flex flex-wrap gap-2 mt-1" role="radiogroup" aria-label="Category">
            {CATEGORY_NAMES.map(key => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={category === key}
                onClick={() => setCategory(key)}
                className={`h-11 pl-3 pr-4 rounded-full inline-flex items-center gap-2 text-sm font-bold transition-colors ${category === key
                  ? `${CATEGORIES[key].tint} ${CATEGORIES[key].text} ring-2 ring-current`
                  : 'bg-background-surface text-slate-300 hover:text-white'}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${CATEGORIES[key].dot}`} aria-hidden="true" />
                {CATEGORIES[key].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="label mb-0">Date</span>
            <span className="text-sm text-slate-400">{shortDate(date, true)}</span>
          </div>
          <div className="flex gap-2">
            {[['Today', 0], ['Tomorrow', 1]].map(([label, offset]) => {
              const iso = isoFrom(offset);
              return (
                <button key={label} type="button" onClick={() => setDate(iso)} className={chip(date === iso)}>
                  {label}
                </button>
              );
            })}
            <label className={`${chip(false)} grid place-items-center cursor-pointer px-0 w-11 shrink-0`} aria-label="Pick a date">
              <CalendarIcon className="w-5 h-5" />
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                aria-label="Date"
                className="sr-only"
              />
            </label>
          </div>
          {fieldError(errors.date, 'event-date-error')}
        </div>

        <button
          type="button"
          onClick={toggleAllDay}
          role="switch"
          aria-checked={allDay}
          className="w-full flex items-center justify-between gap-3 h-14 px-4 rounded-xl bg-background-surface"
        >
          <span className="font-bold text-white">All day</span>
          <span className={`w-12 h-7 rounded-full p-1 transition-colors ${allDay ? 'bg-calendar' : 'bg-background-paper'}`}>
            <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${allDay ? 'translate-x-5' : ''}`} />
          </span>
        </button>

        {!allDay && (
          <div className="space-y-2">
            <TimeStepper label="Starts" value={startTime} onChange={setStartTime} />
            {fieldError(errors.startTime, 'event-start-error')}
            <TimeStepper label="Ends" value={endTime} onChange={setEndTime} hint={length} />
            {fieldError(errors.endTime, 'event-end-error')}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1 h-12">Cancel</button>
          <button
            type="submit"
            disabled={saving}
            className="btn flex-1 h-12 bg-light-primary text-background hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : event ? 'Save entry' : 'Save event'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventFormModal;
