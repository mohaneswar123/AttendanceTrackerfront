import React, { useState } from 'react';
import { PlusIcon } from '../icons';

/**
 * Adding a task is a line you type into, not a button that opens a form.
 *
 * It stays on the screen and keeps focus after each one, because tasks arrive in threes,
 * and the date it uses is the day being looked at, so adding from Today means today.
 */
function AddTask({ defaultDate, onAdd }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setSaving(true);
    setError('');
    const result = await onAdd({ title: text, taskDate: defaultDate, important: false, note: null, steps: [] });
    setSaving(false);
    if (result?.success) setTitle('');
    else setError(result?.message || 'Could not add that task');
  };

  return (
    <form onSubmit={submit}>
      <div className="surface flex items-center gap-3 p-3">
        <PlusIcon className="w-5 h-5 shrink-0 text-tasks" aria-hidden="true" />
        <input
          id="add-task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          aria-label="Add a task"
          maxLength={200}
          className="flex-1 min-w-0 bg-transparent border-0 p-0 text-base md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        {title.trim() && (
          <button type="submit" disabled={saving} className="btn bg-tasks text-white hover:bg-tasks/90 h-9 px-3 shrink-0">
            {saving ? 'Adding…' : 'Add'}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-rose-400 mt-2 px-1" role="alert">{error}</p>}
    </form>
  );
}

export default AddTask;
