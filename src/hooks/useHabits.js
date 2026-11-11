import { useCallback, useEffect, useState } from 'react';
import { habitService, errorMessage } from '../services/api';

/**
 * The student's habits, with the streaks and rates the server worked out.
 *
 * Marking a day returns that habit with its figures already recalculated, so the row is
 * replaced from the answer rather than guessed at. Nothing is shown until the server has
 * saved it, which keeps a streak from flickering up and back down.
 */
export default function useHabits({ includeArchived = false } = {}) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHabits(await habitService.getHabits({ includeArchived }));
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Failed to load your habits'));
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    load();
  }, [load]);

  const clearError = useCallback(() => setError(''), []);

  // Puts one habit back in the list where it already was
  const replace = useCallback((habit) => {
    setHabits(list => list.map(item => (item.id === habit.id ? habit : item)));
  }, []);

  // Every action answers the same way, so the page has one thing to check
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

  const createHabit = useCallback((fields) => run(async () => {
    const habit = await habitService.createHabit(fields);
    setHabits(list => [...list, habit]);
    return { habit };
  }, 'Could not save that habit'), [run]);

  const updateHabit = useCallback((habitId, fields) => run(async () => {
    const habit = await habitService.updateHabit(habitId, fields);
    replace(habit);
    return { habit };
  }, 'Could not save that habit'), [run, replace]);

  const mark = useCallback((habitId, date, entry) => run(async () => {
    const habit = await habitService.mark(habitId, date, entry);
    replace(habit);
    return { habit };
  }, 'Could not mark that day'), [run, replace]);

  const clearMark = useCallback((habitId, date) => run(async () => {
    const habit = await habitService.clearMark(habitId, date);
    replace(habit);
    return { habit };
  }, 'Could not undo that'), [run, replace]);

  // Archiving changes whether the habit belongs in the list being shown, so reload
  const setArchived = useCallback((habitId, archived) => run(async () => {
    const habit = archived
      ? await habitService.archiveHabit(habitId)
      : await habitService.unarchiveHabit(habitId);
    if (includeArchived) {
      replace(habit);
    } else {
      setHabits(list => list.filter(item => item.id !== habitId));
    }
    return { habit };
  }, 'Could not archive that habit'), [run, replace, includeArchived]);

  const deleteHabit = useCallback((habitId) => run(async () => {
    await habitService.deleteHabit(habitId);
    setHabits(list => list.filter(item => item.id !== habitId));
    return {};
  }, 'Could not delete that habit'), [run]);

  return {
    habits,
    loading,
    error,
    clearError,
    reload: load,
    createHabit,
    updateHabit,
    mark,
    clearMark,
    setArchived,
    deleteHabit
  };
}
