import { useCallback, useContext, useEffect, useState } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { attendanceService, errorMessage } from '../services/api';

/**
 * The weekly class plan: { MONDAY: [{subjectId, hours}], ... }.
 *
 * `plan` is null while loading, then always an object — a student with no plan gets {}
 * rather than an error, because an empty week is a starting point, not a fault. Saving a
 * day answers with the whole corrected plan, so the page never guesses at what the server
 * kept.
 */
export default function useAttendancePlan() {
  const { currentUser } = useContext(AttendanceContext);
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.isAdmin) {
      setPlan({});
      return;
    }
    let cancelled = false;
    attendanceService.getPlan()
      .then(result => { if (!cancelled) setPlan(result || {}); })
      .catch(err => {
        if (!cancelled) {
          setPlan({});
          setError(errorMessage(err, 'Could not load your class plan'));
        }
      });
    return () => { cancelled = true; };
  }, [currentUser]);

  const saveDay = useCallback(async (weekday, classes) => {
    setSaving(true);
    try {
      const next = await attendanceService.setPlanDay(weekday, classes);
      setPlan(next || {});
      setError('');
      return { success: true };
    } catch (err) {
      const message = errorMessage(err, 'Could not save that day');
      setError(message);
      return { success: false, message };
    } finally {
      setSaving(false);
    }
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return { plan, saving, error, clearError, saveDay };
}
