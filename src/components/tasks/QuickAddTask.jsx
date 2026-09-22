import React, { useEffect, useRef, useState } from 'react';
import PriorityPicker from './PriorityPicker';

// Add tasks in seconds: type a title and press Enter. The form stays open for the next
// task; Escape or clicking outside closes it.
function QuickAddTask({ defaultDate, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [taskDate, setTaskDate] = useState(defaultDate);
  const [priority, setPriority] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const closeOnOutside = (e) => !formRef.current?.contains(e.target) && onClose();
    const closeOnEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    const result = await onAdd({ title: title.trim(), taskDate, priority });
    setSaving(false);
    if (result.success) {
      setTitle('');
      setPriority(null);
      setError('');
      titleRef.current?.focus();
    } else {
      setError(result.message);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="glass-panel rounded-3xl p-4 md:p-5 space-y-3 border border-primary-500/30 animate-fade-in">
      <div className="flex gap-2">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          maxLength={200}
          aria-label="Task title"
          className="input flex-1"
        />
        <button type="submit" disabled={!title.trim() || saving} className="btn btn-primary px-5">
          {saving ? 'Adding…' : 'Add'}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Date
          <input
            type="date"
            value={taskDate}
            onChange={(e) => e.target.value && setTaskDate(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1.5 text-base md:text-sm text-slate-200 outline-none focus:border-primary-500 [color-scheme:dark]"
          />
        </label>
        <PriorityPicker value={priority} onChange={setPriority} />
        <span className="hidden md:inline ml-auto text-xs text-slate-500">Enter to add · Esc to close</span>
      </div>
      {error && <p className="text-sm text-rose-400" role="alert">{error}</p>}
    </form>
  );
}

export default QuickAddTask;
