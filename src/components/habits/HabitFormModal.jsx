import React, { useEffect, useRef, useState } from 'react';
import {
  CATEGORIES, COLOR_NAMES, DAYS, DAY_SHORT, GOALS, SCHEDULES, TEMPLATES, colorOf
} from '../../utils/habits';
import { MinusIcon, PlusIcon } from '../icons';

const ICONS = ['📘', '📖', '🧠', '✍️', '💧', '🥗', '🏃', '🧘', '🌙', '😴', '☀️', '🚭'];

const blank = {
  name: '', icon: '📘', color: 'VIOLET', category: 'STUDY', reason: '',
  schedule: 'DAILY', weekdays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'], timesPerWeek: 3,
  goal: 'YES_NO', target: 1, unit: '', reminderTime: ''
};

/** A number with a minus and a plus either side, both big enough to tap */
function Stepper({ label, value, min, max, step = 1, suffix, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`Less ${label.toLowerCase()}`}
        className="w-11 h-11 rounded-xl border border-line text-slate-400 grid place-items-center disabled:opacity-40 hover:text-slate-200"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      <span className="flex-1 text-center text-lg font-semibold tabular-nums text-white">
        {value}{suffix ? ` ${suffix}` : ''}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={`More ${label.toLowerCase()}`}
        className="w-11 h-11 rounded-xl border border-line text-slate-400 grid place-items-center disabled:opacity-40 hover:text-slate-200"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Setting a habit up. The form only asks for what the choices above make relevant: which
 * days for "pick days", how many for "times a week", a target for a count or time goal.
 * Anything else would be a field the student has to learn to ignore.
 */
function HabitFormModal({ habit, initial, onSave, onArchive, onDelete, onClose }) {
  const [fields, setFields] = useState(() => ({
    ...blank,
    ...(initial || {}),
    ...(habit
      ? {
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        category: habit.category,
        reason: habit.reason || '',
        schedule: habit.schedule,
        weekdays: habit.weekdays?.length ? habit.weekdays : blank.weekdays,
        timesPerWeek: habit.timesPerWeek || blank.timesPerWeek,
        goal: habit.goal,
        target: habit.target,
        unit: habit.unit || '',
        reminderTime: habit.reminderTime || ''
      }
      : {})
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const firstField = useRef(null);

  useEffect(() => {
    firstField.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (patch) => setFields(current => ({ ...current, ...patch }));

  const applyTemplate = (template) => setFields({ ...blank, ...template, unit: template.unit || '', reason: template.reason || '' });

  const toggleDay = (day) => set({
    weekdays: fields.weekdays.includes(day)
      ? fields.weekdays.filter(d => d !== day)
      : DAYS.filter(d => d === day || fields.weekdays.includes(d))
  });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const result = await onSave({
      name: fields.name,
      icon: fields.icon,
      color: fields.color,
      category: fields.category,
      reason: fields.reason || null,
      schedule: fields.schedule,
      weekdays: fields.schedule === 'CUSTOM_DAYS' ? fields.weekdays : null,
      timesPerWeek: fields.schedule === 'TIMES_PER_WEEK' ? Number(fields.timesPerWeek) : null,
      goal: fields.goal,
      target: fields.goal === 'YES_NO' ? null : Number(fields.target),
      unit: fields.goal === 'COUNT' ? fields.unit || null : null,
      reminderTime: fields.reminderTime || null,
      startDate: null
    });
    setSaving(false);
    if (!result?.success) setError(result?.message || 'Could not save that habit');
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={habit ? 'Edit habit' : 'New habit'}
        className="w-full md:max-w-md max-h-[92vh] flex flex-col rounded-t-xl md:rounded-lg overlay animate-slide-up md:animate-fade-in"
      >
        {/* The fields scroll; Cancel and Save do not. The sheet runs to about 1,080px of
            content on a phone, so both buttons used to sit a few hundred pixels below the
            fold and students filled one field without ever seeing how to finish. */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
        <h2 className="font-semibold text-white">{habit ? 'Edit habit' : 'New habit'}</h2>

        {error && <div className="notice notice-danger" role="alert">{error}</div>}

        <div>
          <label htmlFor="habit-name" className="label">Name</label>
          <input
            id="habit-name"
            ref={firstField}
            value={fields.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Revise lecture"
            className="input"
            maxLength={60}
          />
          {!habit && (
            <div className="flex flex-wrap gap-1.5 mt-2" role="group" aria-label="Start from a template">
              {TEMPLATES.map(template => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="h-8 px-2.5 rounded-full bg-background-surface text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <span aria-hidden="true">{template.icon}</span> {template.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="label">Icon</span>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => set({ icon })}
                aria-label={`Icon ${icon}`}
                aria-pressed={fields.icon === icon}
                className={`w-11 h-11 rounded-xl border text-xl transition-colors ${fields.icon === icon
                  ? 'bg-teal-500/20 border-teal-500/60'
                  : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Colour</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Colour">
            {COLOR_NAMES.map(name => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={fields.color === name}
                aria-label={name.toLowerCase()}
                onClick={() => set({ color: name })}
                className={`w-9 h-9 rounded-full ${colorOf(name).dot} ${fields.color === name ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white/70' : ''}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="habit-category" className="label">Category</label>
          <select
            id="habit-category"
            value={fields.category}
            onChange={(e) => set({ category: e.target.value })}
            className="input"
          >
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>{category.icon} {category.label}</option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">What counts as doing it</span>
          <div className="segmented w-full" role="radiogroup" aria-label="What counts as doing it">
            {GOALS.map(option => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={fields.goal === option.value}
                onClick={() => set({ goal: option.value, target: option.value === 'DURATION' ? 30 : 8 })}
                className="segmented-item flex-1"
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-1.5">{GOALS.find(g => g.value === fields.goal)?.hint}</p>
        </div>

        {fields.goal !== 'YES_NO' && (
          <div className="space-y-2">
            <Stepper
              label={fields.goal === 'DURATION' ? 'minutes' : 'the target'}
              value={Number(fields.target) || 1}
              min={1}
              max={fields.goal === 'DURATION' ? 480 : 100}
              step={fields.goal === 'DURATION' ? 5 : 1}
              suffix={fields.goal === 'DURATION' ? 'min' : fields.unit}
              onChange={(target) => set({ target })}
            />
            {fields.goal === 'COUNT' && (
              <div>
                <label htmlFor="habit-unit" className="label">Counted in</label>
                <input
                  id="habit-unit"
                  value={fields.unit}
                  onChange={(e) => set({ unit: e.target.value })}
                  placeholder="glasses"
                  className="input"
                  maxLength={12}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <span className="label">Repeat</span>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Repeat">
            {SCHEDULES.map(option => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={fields.schedule === option.value}
                onClick={() => set({ schedule: option.value })}
                className={`h-10 px-3.5 rounded-full text-sm font-medium transition-colors ${fields.schedule === option.value
                  ? 'bg-teal-500 text-white'
                  : 'bg-background-surface text-slate-400 hover:text-slate-200'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {fields.schedule === 'CUSTOM_DAYS' && (
          <div className="grid grid-cols-7 gap-1" role="group" aria-label="Days of the week">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                aria-pressed={fields.weekdays.includes(day)}
                aria-label={DAY_SHORT[day]}
                className={`h-11 rounded-lg text-xs font-medium transition-colors ${fields.weekdays.includes(day)
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'}`}
              >
                {DAY_SHORT[day].slice(0, 2)}
              </button>
            ))}
          </div>
        )}

        {fields.schedule === 'TIMES_PER_WEEK' && (
          <Stepper
            label="times a week"
            value={Number(fields.timesPerWeek) || 1}
            min={1}
            max={7}
            suffix="times a week"
            onChange={(timesPerWeek) => set({ timesPerWeek })}
          />
        )}

        <div>
          <label htmlFor="habit-reminder" className="label">Usual time</label>
          <div className="flex gap-2">
            <input
              id="habit-reminder"
              type="time"
              value={fields.reminderTime}
              onChange={(e) => set({ reminderTime: e.target.value })}
              className="input flex-1"
            />
            {fields.reminderTime && (
              <button type="button" onClick={() => set({ reminderTime: '' })} className="btn btn-secondary shrink-0">
                Turn off
              </button>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            When you usually do this. It orders the Today list and labels the row.
          </p>
        </div>

        <div>
          <label htmlFor="habit-reason" className="label">Why it matters (optional)</label>
          <textarea
            id="habit-reason"
            value={fields.reason}
            onChange={(e) => set({ reason: e.target.value })}
            placeholder="Half an hour now saves a week before exams"
            className="input"
            rows={2}
            maxLength={200}
          />
        </div>

        </div>

        <div className="shrink-0 border-t border-line p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn bg-teal-500 text-white hover:bg-teal-600">
            {saving ? 'Saving…' : 'Save habit'}
          </button>
        </div>

        {habit && (
          <div className="pt-3 border-t border-line flex gap-2">
            {habit.archived ? (
              <button type="button" onClick={() => onArchive(habit, false)} className="btn btn-secondary flex-1">
                Restore
              </button>
            ) : (
              <button type="button" onClick={() => onArchive(habit, true)} className="btn btn-secondary flex-1">
                Archive
              </button>
            )}
            <button type="button" onClick={() => onDelete(habit)} className="btn btn-ghost text-rose-400">
              Delete
            </button>
          </div>
        )}
        {habit && (
          <p className="mt-2 text-sm text-slate-400">
            Archiving keeps every day you recorded. Deleting only works before a habit has any.
          </p>
        )}
        </div>
      </form>
    </div>
  );
}

export default HabitFormModal;
