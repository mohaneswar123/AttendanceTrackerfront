import { useCallback, useEffect, useState } from 'react';
import { timetableService, errorMessage } from '../services/api';

// The student's timetable modes and the chosen mode's week. Everything is shown once the
// server has saved it.
export default function useTimetable() {
  const [modes, setModes] = useState([]);
  const [selectedModeId, setSelectedModeId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Keeps a valid mode selected: the active one at first, then whatever remains
  const applyModes = useCallback((list) => {
    setModes(list);
    setSelectedModeId(current => {
      if (current && list.some(mode => mode.id === current)) return current;
      return (list.find(mode => mode.active) || list[0])?.id ?? null;
    });
  }, []);

  const loadModes = useCallback(async () => {
    setLoading(true);
    try {
      applyModes(await timetableService.getModes());
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Failed to load your timetable'));
    } finally {
      setLoading(false);
    }
  }, [applyModes]);

  useEffect(() => {
    loadModes();
  }, [loadModes]);

  // The mode list carries each mode's activity count, so keep the open mode's count in step
  const applyActivities = useCallback((modeId, list) => {
    setActivities(list);
    setModes(current => current.map(mode => (mode.id === modeId ? { ...mode, activityCount: list.length } : mode)));
  }, []);

  const loadActivities = useCallback(async (modeId) => {
    if (!modeId) {
      setActivities([]);
      return;
    }
    try {
      applyActivities(modeId, await timetableService.getActivities(modeId));
    } catch (err) {
      setError(errorMessage(err, 'Failed to load this mode'));
    }
  }, [applyActivities]);

  useEffect(() => {
    loadActivities(selectedModeId);
  }, [selectedModeId, loadActivities]);

  const run = async (action, fallbackMessage) => {
    try {
      return { success: true, value: await action() };
    } catch (err) {
      return { success: false, message: errorMessage(err, fallbackMessage) };
    }
  };

  // Modes

  const saveMode = async (modeId, mode) => {
    const result = await run(
      () => (modeId ? timetableService.updateMode(modeId, mode) : timetableService.createMode(mode)),
      'Failed to save the mode');
    if (result.success) {
      await loadModes();
      if (!modeId) setSelectedModeId(result.value.id);
    }
    return result;
  };

  const activateMode = async (modeId) => {
    const result = await run(() => timetableService.activateMode(modeId), 'Failed to switch mode');
    if (result.success) applyModes(result.value);
    return result;
  };

  const deleteMode = async (modeId) => {
    const result = await run(() => timetableService.deleteMode(modeId), 'Failed to delete the mode');
    if (result.success) {
      setSelectedModeId(current => (current === modeId ? null : current));
      applyModes(result.value);
    }
    return result;
  };

  // Activities

  const saveActivity = async (activityId, activity) => {
    const result = await run(
      () => (activityId
        ? timetableService.updateActivity(activityId, activity)
        : timetableService.createActivity(selectedModeId, activity)),
      'Failed to save the activity');
    if (result.success) await loadActivities(selectedModeId);
    return result;
  };

  const deleteActivity = async (activityId) => {
    const result = await run(() => timetableService.deleteActivity(activityId), 'Failed to delete the activity');
    if (result.success) await loadActivities(selectedModeId);
    return result;
  };

  const copyDay = async (fromDay, toDays) => {
    const result = await run(() => timetableService.copyDay(selectedModeId, fromDay, toDays), 'Failed to copy the day');
    if (result.success) applyActivities(selectedModeId, result.value);
    return result;
  };

  return {
    modes,
    selectedModeId,
    selectMode: setSelectedModeId,
    selectedMode: modes.find(mode => mode.id === selectedModeId) || null,
    activities,
    loading,
    error,
    clearError: () => setError(''),
    saveMode,
    activateMode,
    deleteMode,
    saveActivity,
    deleteActivity,
    copyDay
  };
}
