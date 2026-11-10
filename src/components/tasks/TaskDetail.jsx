import React, { useEffect, useRef, useState } from 'react';
import { dayLabel, isDone } from '../../utils/tasks';
import { todayLocal } from '../../utils/date';
import { CheckIcon, CloseIcon, PlusIcon, StarIcon, TrashIcon } from '../icons';

/**
 * One task, opened up: its steps, when it is for, a note, and whether it matters.
 *
 * Everything saves on close rather than on every keystroke, so a half-typed step is
 * never written, and the sheet always sends the whole task: steps are replaced as a set,
 * which makes adding, renaming, ticking and deleting one request instead of four.
 */
function TaskDetail({ task, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(task.title);
  const [taskDate, setTaskDate] = useState(task.taskDate);
  const [important, setImportant] = useState(Boolean(task.important));
  const [note, setNote] = useState(task.note || '');
  const [steps, setSteps] = useState(() => (task.steps || []).map(step => ({ ...step })));
  const [newStep, setNewStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const stepField = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addStep = () => {
    const text = newStep.trim();
    if (!text) return;
    setSteps(current => [...current, { id: null, title: text, done: false }]);
    setNewStep('');
    stepField.current?.focus();
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const result = await onSave({
      title,
      taskDate,
      important,
      note: note.trim() || null,
      steps: steps.map(step => ({ id: step.id, title: step.title, done: step.done }))
    });
    setSaving(false);
    if (result?.success) onClose();
    else setError(result?.message || 'Could not save that task');
  };

  const done = isDone(task);
  const ticked = steps.filter(step => step.done).length;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl overlay p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 animate-slide-up md:animate-fade-in"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`w-6 h-6 mt-0.5 shrink-0 rounded-full border-2 grid place-items-center ${done
              ? 'bg-tasks border-tasks text-white' : 'border-line'}`}
          >
            {done && <CheckIcon className="w-3.5 h-3.5" />}
          </span>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
            rows={1}
            maxLength={200}
            className="flex-1 min-w-0 bg-transparent border-0 p-0 text-base font-semibold text-white resize-none focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setImportant(v => !v)}
            aria-pressed={important}
            aria-label={important ? 'Remove the star' : 'Star this task'}
            className={`w-9 h-9 shrink-0 rounded-lg grid place-items-center ${important ? 'text-streak' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <StarIcon className="w-5 h-5" filled={important} />
          </button>
        </div>

        {error && <div className="notice notice-danger" role="alert">{error}</div>}

        <div>
          <div className="flex items-baseline justify-between">
            <span className="label mb-0">Steps</span>
            {steps.length > 0 && <span className="text-xs text-slate-500">{ticked} of {steps.length}</span>}
          </div>
          <ul className="mt-2 space-y-1.5">
            {steps.map((step, index) => (
              <li key={step.id || `new-${index}`} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSteps(current => current.map((s, i) => (i === index ? { ...s, done: !s.done } : s)))}
                  aria-pressed={step.done}
                  aria-label={step.done ? `Mark step "${step.title}" not done` : `Mark step "${step.title}" done`}
                  className={`w-5 h-5 shrink-0 rounded-full border-2 grid place-items-center ${step.done
                    ? 'bg-tasks border-tasks text-white' : 'border-line hover:border-tasks'}`}
                >
                  {step.done && <CheckIcon className="w-3 h-3" />}
                </button>
                <input
                  value={step.title}
                  onChange={(e) => setSteps(current => current.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)))}
                  aria-label={`Step ${index + 1}`}
                  maxLength={200}
                  className={`flex-1 min-w-0 bg-transparent border-0 p-0 text-sm focus:outline-none ${step.done ? 'line-through text-slate-500' : 'text-slate-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setSteps(current => current.filter((_, i) => i !== index))}
                  aria-label={`Remove step "${step.title}"`}
                  className="w-8 h-8 shrink-0 rounded-lg grid place-items-center text-slate-500 hover:text-rose-400"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-2.5">
            <PlusIcon className="w-5 h-5 shrink-0 text-slate-500" aria-hidden="true" />
            <input
              ref={stepField}
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addStep();
                }
              }}
              onBlur={addStep}
              placeholder="Add a step"
              aria-label="Add a step"
              maxLength={200}
              className="flex-1 min-w-0 bg-transparent border-0 p-0 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-date" className="label">Due</label>
          <input
            id="task-date"
            type="date"
            value={taskDate}
            onChange={(e) => e.target.value && setTaskDate(e.target.value)}
            className="input"
          />
          <div className="flex gap-1.5 mt-2">
            {[['Today', 0], ['Tomorrow', 1], ['Next week', 7]].map(([label, offset]) => {
              const date = new Date(`${todayLocal()}T00:00:00`);
              date.setDate(date.getDate() + offset);
              const pad = (n) => String(n).padStart(2, '0');
              const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTaskDate(iso)}
                  className={`h-8 px-2.5 rounded-full text-xs font-medium transition-colors ${taskDate === iso
                    ? 'bg-tasks text-white'
                    : 'bg-background-surface text-slate-400 hover:text-slate-200'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {taskDate < todayLocal() && (
            <p className="text-xs text-rose-400 mt-1.5">
              This was due {dayLabel(taskDate).toLowerCase()} and is still showing under Overdue.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="task-note" className="label">Note</label>
          <textarea
            id="task-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A link, a page number, anything that does not fit in the title"
            rows={3}
            maxLength={1000}
            className="input"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={() => onDelete(task)} aria-label="Delete this task" className="btn btn-ghost text-rose-400">
            <TrashIcon className="w-4 h-4" />
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button type="button" onClick={save} disabled={saving} className="btn bg-tasks text-white hover:bg-tasks/90 flex-1">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
