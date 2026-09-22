import { useCallback, useEffect, useMemo, useState } from 'react';
import { taskService, errorMessage } from '../services/api';
import { addDays, todayLocal } from '../utils/date';

export const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };

// The inclusive from/to dates behind each date filter. The filter only decides which
// tasks show; it never changes their status.
export function filterRange(filterType, customDate) {
  const today = todayLocal();
  switch (filterType) {
    case 'today':
      return { from: today, to: today };
    case 'yesterday': {
      const yesterday = addDays(today, -1);
      return { from: yesterday, to: yesterday };
    }
    case 'upcoming':
      return { from: addDays(today, 1) };
    case 'custom':
      return { from: customDate, to: customDate };
    default:
      return {};
  }
}

const inRange = (task, { from, to }) => (!from || task.taskDate >= from) && (!to || task.taskDate <= to);

const byPosition = (a, b) => a.position - b.position;

// The student's tasks for one date filter, grouped into Kanban columns
export default function useTaskBoard(filterType, customDate, enabled) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { from, to } = filterRange(filterType, customDate);
  const range = useMemo(() => ({ from, to }), [from, to]);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setTasks(await taskService.getTasks(range));
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Failed to load your tasks'));
    } finally {
      setLoading(false);
    }
  }, [enabled, range]);

  useEffect(() => {
    setTasks([]);
    load();
  }, [load]);

  const columns = useMemo(
    () => Object.fromEntries(STATUSES.map(status => [status, tasks.filter(t => t.status === status).sort(byPosition)])),
    [tasks]
  );

  // Resolves to { success, task, visible } where visible says whether the current filter shows it
  const createTask = async (fields) => {
    try {
      const created = await taskService.createTask(fields);
      const visible = inRange(created, range);
      if (visible) setTasks(prev => [...prev, created]);
      return { success: true, task: created, visible };
    } catch (err) {
      return { success: false, message: errorMessage(err, 'Failed to add the task') };
    }
  };

  const updateTask = async (taskId, fields) => {
    try {
      const saved = await taskService.updateTask(taskId, fields);
      const visible = inRange(saved, range);
      setTasks(prev => visible ? prev.map(t => (t.id === taskId ? saved : t)) : prev.filter(t => t.id !== taskId));
      return { success: true, task: saved, visible };
    } catch (err) {
      return { success: false, message: errorMessage(err, 'Failed to save the task') };
    }
  };

  // Puts the task at `index` among the cards shown in the `status` column. The card moves
  // at once; the server then places it between the same neighbours.
  const moveTask = async (taskId, status, index) => {
    const others = columns[status].filter(t => t.id !== taskId);
    const at = Math.max(0, Math.min(index, others.length));
    const after = others[at - 1] || null;
    const before = others[at] || null;

    const current = tasks.find(t => t.id === taskId);
    if (current?.status === status && columns[status].indexOf(current) === at) return { success: true };

    // A position that sorts right on screen until the server's answer arrives
    const guess = after && before ? (after.position + before.position) / 2
      : after ? after.position + 1
        : before ? before.position - 1
          : 0;
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status, position: guess } : t)));

    try {
      const saved = await taskService.moveTask(taskId, status, after?.id ?? null, before?.id ?? null);
      setTasks(prev => prev.map(t => (t.id === taskId ? saved : t)));
      return { success: true };
    } catch (err) {
      setError(errorMessage(err, 'Failed to move the task'));
      load();
      return { success: false };
    }
  };

  // To the end of another column (the ✓ button and the "Move to" menu)
  const moveTaskToColumn = (taskId, status) => moveTask(taskId, status, columns[status].length);

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      return { success: true };
    } catch (err) {
      return { success: false, message: errorMessage(err, 'Failed to delete the task') };
    }
  };

  return {
    columns,
    loading,
    error,
    clearError: () => setError(''),
    createTask,
    updateTask,
    moveTask,
    moveTaskToColumn,
    deleteTask
  };
}
