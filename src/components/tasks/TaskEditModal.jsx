import React, { useEffect, useState } from 'react';
import PriorityPicker from './PriorityPicker';

// Edit a task's title, date and priority
function TaskEditModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task.title);
  const [taskDate, setTaskDate] = useState(task.taskDate);
  const [priority, setPriority] = useState(task.priority || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Enter a title');
    setSaving(true);
    const result = await onSave({ title: title.trim(), taskDate, priority });
    setSaving(false);
    if (!result.success) setError(result.message);
  };

  return (
    // A bottom sheet on phones, centred on larger screens
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full md:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-2xl bg-slate-900 border border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 shadow-2xl animate-slide-up md:animate-fade-in"
      >
        <h4 id="edit-task-title" className="text-white font-semibold">Edit task</h4>
        <label className="block">
          <span className="label">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus className="input" />
        </label>
        <label className="block">
          <span className="label">Date</span>
          <input type="date" value={taskDate} onChange={(e) => e.target.value && setTaskDate(e.target.value)} className="input [color-scheme:dark]" />
        </label>
        <div>
          <span className="label">Priority</span>
          <PriorityPicker value={priority} onChange={setPriority} />
        </div>
        {error && <p className="text-sm text-rose-400" role="alert">{error}</p>}
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

export default TaskEditModal;
