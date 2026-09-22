import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  authService,
  subjectService,
  attendanceService,
  resetService,
  adminService,
  sessionStore,
  errorMessage
} from '../services/api';

// Create the context
export const AttendanceContext = createContext();

// The backend sends `id`; the UI uses `_id`
const withUnderscoreId = ({ id, ...rest }) => ({ ...rest, _id: rest._id || id });

const toSubject = (subject) => ({ _id: subject._id || subject.id, name: subject.name });

const toRecord = (record, subject) => ({
  ...withUnderscoreId(record),
  subject: subject || null,
  subjectId: record.subjectId
});

// Create a provider component
export const AttendanceProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    // Earlier versions kept the account here without a token; those sessions can't be used
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loggedUser');
    return sessionStore.load();
  });

  const currentUser = useMemo(
    () => (session ? { ...session.user, isAdmin: !!session.isAdmin } : null),
    [session]
  );
  // Only student accounts have subjects and attendance
  const userId = currentUser && !currentUser.isAdmin ? currentUser._id : null;

  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user data when the signed-in user changes
  useEffect(() => {
    setSubjects([]);
    setAttendanceRecords([]);
    setError(null);
    if (!userId) return;

    let cancelled = false;
    const loadUserData = async () => {
      setLoading(true);
      try {
        const [subjectsData, recordsData] = await Promise.all([
          subjectService.getSubjects(userId),
          attendanceService.getRecords(userId)
        ]);
        if (cancelled) return;
        const normalizedSubjects = subjectsData.map(toSubject);
        const subjectMap = Object.fromEntries(normalizedSubjects.map(s => [s._id, s]));
        setSubjects(normalizedSubjects);
        setAttendanceRecords(recordsData.map(r => toRecord(r, subjectMap[r.subjectId])));
      } catch (err) {
        console.error('Error loading user data:', err);
        if (!cancelled) setError(errorMessage(err, 'Failed to load your data. Please try again.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadUserData();

    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [userId]);

  const startSession = (token, user, isAdmin) => {
    const next = { token, user: withUnderscoreId(user), isAdmin };
    sessionStore.save(next);
    setSession(next);
  };

  const updateSessionUser = useCallback((changes) => {
    setSession(prev => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, ...changes } };
      sessionStore.save(next);
      return next;
    });
  }, []);

  // Auth methods

  // Creates the account; the user signs in afterwards
  const register = async (userData) => {
    setLoading(true);
    try {
      await authService.register(userData);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return {
        success: false,
        code: err.response?.data?.code,
        message: errorMessage(err, 'Registration failed')
      };
    } finally {
      setLoading(false);
    }
  };

  // Throws on failure so the page can tell bad credentials from an inactive subscription
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      startSession(token, user, false);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const { token, user } = await adminService.login(email, password);
      startSession(token, user, true);
      return user;
    } finally {
      setLoading(false);
    }
  };

  // Re-reads the signed-in user, e.g. to pick up a renewed subscription. A lapsed
  // subscription or rejected token is handled by the API client, which redirects.
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      updateSessionUser(withUnderscoreId(user));
    } catch (err) {
      // Network errors (e.g. the server is still starting) keep the current session
      console.warn('Could not refresh user:', err);
    }
  }, [updateSessionUser]);

  const logout = () => {
    sessionStore.clear();
    setSession(null);
  };

  // Update email for the user
  const updateEmail = async (newEmail) => {
    setLoading(true);
    try {
      const updated = await authService.updateEmail(userId, newEmail);
      updateSessionUser({ email: updated.email });
      return { success: true, message: 'Email updated' };
    } catch (err) {
      console.error('Error updating email:', err);
      return { success: false, message: errorMessage(err, 'Failed to update email') };
    } finally {
      setLoading(false);
    }
  };

  // Change password for the user
  const changePassword = async (oldPassword, newPassword) => {
    setLoading(true);
    try {
      const result = await authService.changePassword(oldPassword, newPassword);
      return { success: true, message: result.message };
    } catch (err) {
      console.error('Error changing password:', err);
      return { success: false, message: errorMessage(err, 'Failed to change password') };
    } finally {
      setLoading(false);
    }
  };

  // Subject methods
  const addSubject = async (subjectName) => {
    setLoading(true);
    try {
      const newSubject = await subjectService.addSubject(userId, subjectName);
      setSubjects(prev => [...prev, toSubject(newSubject)]);
      return { success: true };
    } catch (err) {
      console.error('Error adding subject:', err);
      return { success: false, message: errorMessage(err, 'Failed to add subject') };
    } finally {
      setLoading(false);
    }
  };

  // Deletes the subject and, on the server, all its attendance records
  const removeSubject = async (subjectId) => {
    setLoading(true);
    try {
      await subjectService.deleteSubject(subjectId, userId);
      setSubjects(prev => prev.filter(s => s._id !== subjectId));
      setAttendanceRecords(prev => prev.filter(record => record.subjectId !== subjectId));
      return { success: true };
    } catch (err) {
      console.error('Error removing subject:', err);
      return { success: false, message: errorMessage(err, 'Failed to delete subject') };
    } finally {
      setLoading(false);
    }
  };

  // Attendance record methods

  // record: { subjectId, status, date, classNumber } where classNumber is hours
  const addAttendanceRecord = async (record) => {
    setLoading(true);
    try {
      const subject = subjects.find(s => s._id === record.subjectId);
      if (!subject) {
        return { success: false, message: 'Subject not found' };
      }
      const newRecord = await attendanceService.addRecord(
        userId,
        subject._id,
        record.status,
        record.date,
        record.classNumber
      );
      setAttendanceRecords(prev => [...prev, toRecord(newRecord, subject)]);
      return { success: true };
    } catch (err) {
      console.error('Error adding attendance:', err);
      return { success: false, message: errorMessage(err, 'Failed to add attendance record') };
    } finally {
      setLoading(false);
    }
  };

  const deleteAttendanceRecord = async (id) => {
    setLoading(true);
    try {
      await attendanceService.deleteRecord(id);
      setAttendanceRecords(prev => prev.filter(record => record._id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting attendance:', err);
      return { success: false, message: errorMessage(err, 'Failed to delete attendance record') };
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    setLoading(true);
    try {
      await resetService.resetUserData(userId);
      setSubjects([]);
      setAttendanceRecords([]);
      return { success: true };
    } catch (err) {
      console.error('Error resetting data:', err);
      return { success: false, message: errorMessage(err, 'Failed to reset data') };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    subjects,
    attendanceRecords,
    loading,
    error,
    register,
    login,
    adminLogin,
    refreshUser,
    updateEmail,
    changePassword,
    logout,
    addAttendanceRecord,
    deleteAttendanceRecord,
    addSubject,
    removeSubject,
    resetAllData
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};
