import { useCallback, useEffect, useState } from 'react';
import { taskService, errorMessage } from '../services/api';

/**
 * Every task the student has, in the order they put them.
 *
 * The whole list is fetched rather than a date window, because the views slice it
 * differently and one of them, Today, has to include everything from earlier days that
 * was never finished. Asking the server for "today" was what made overdue work vanish.
 */
/** Smaller position first: the order the student dragged the list into */
const byPosition = (list) => [...list].sort((a, b) => a.position - b.position);

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(byPosition(await taskService.getTasks()));
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Failed to load your tasks'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clearError = useCallback(() => setError(''), []);

  // Re-sorted, because moving a task changes where it belongs in the list
  const replace = useCallback((task) => {
    setTasks(list => byPosition(list.map(item => (item.id === task.id ? task : item))));
  }, []);

  const run = useCallback(async (action, fallback) => {
    try {
      const result = await action();
      setError('');
      return { success: true, ...result };
    } catch (err) {
      const message = errorMessage(err, fallback);
      setError(message);
      return { success: false, message };
    }
  }, []);

  const createTask = useCallback((fields) => run(async () => {
    const task = await taskService.createTask(fields);
    setTasks(list => byPosition([...list, task]));
    return { task };
  }, 'Could not add that task'), [run]);

  const saveTask = useCallback((taskId, fields) => run(async () => {
    const task = await taskService.updateTask(taskId, fields);
    replace(task);
    return { task };
  }, 'Could not save that task'), [run, replace]);

  const setDone = useCallback((taskId, done) => run(async () => {
    const task = await taskService.setDone(taskId, done);
    replace(task);
    return { task };
  }, 'Could not change that task'), [run, replace]);

  const deleteTask = useCallback((taskId) => run(async () => {
    await taskService.deleteTask(taskId);
    setTasks(list => list.filter(item => item.id !== taskId));
    return {};
  }, 'Could not delete that task'), [run]);

  /**
   * Dropped onto another task: it takes that task's place, so the one it landed on moves
   * down if it came from above and up if it came from below.
   */
  const reorder = useCallback((activeId, overId) => run(async () => {
    const order = [...tasks].sort((a, b) => a.position - b.position);
    const from = order.findIndex(task => task.id === activeId);
    const to = order.findIndex(task => task.id === overId);
    if (from < 0 || to < 0) return {};

    const movingDown = from < to;
    const neighbours = movingDown
      ? { afterTaskId: overId, beforeTaskId: order[to + 1]?.id ?? null }
      : { afterTaskId: order[to - 1]?.id ?? null, beforeTaskId: overId };

    const task = await taskService.moveTask(activeId, neighbours);
    replace(task);
    return { task };
  }, 'Could not move that task'), [run, replace, tasks]);

  return {
    tasks, loading, error, clearError, reload: load,
    createTask, saveTask, setDone, deleteTask, reorder
  };
}
