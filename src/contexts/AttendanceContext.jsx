import React, { createContext, useState, useEffect } from 'react';
import { authService, subjectService, attendanceService, resetService, adminService } from '../services/api';

// Create the context
export const AttendanceContext = createContext();

// Create a provider component
export const AttendanceProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return null;
    try {
      const parsed = JSON.parse(savedUser);
      // Migration: if old key 'id' exists but '_id' missing, map it.
      if (parsed && parsed.id && !parsed._id) {
        parsed._id = parsed.id;
        delete parsed.id; // optional cleanup
      }
      return parsed;
    } catch {
      return null;
    }
  });
  
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user data when current user changes
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setSubjects([]);
      setAttendanceRecords([]);
    }
  }, [currentUser]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load subjects
      const subjectsData = await subjectService.getSubjects(currentUser._id);
      const normalizedSubjects = subjectsData.map(subject => ({
        _id: subject._id || subject.id,
        name: subject.name
      }));
      setSubjects(normalizedSubjects);
      const subjectMap = normalizedSubjects.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});
      
      // Load attendance records and normalize subject reference
      const recordsData = await attendanceService.getRecords(currentUser._id);
      const normalizedRecords = recordsData.map(r => {
        const subjObj = r.subject && typeof r.subject === 'object' ? r.subject : null;
        const subjId = subjObj?._id || subjObj?.id || r.subjectId || (typeof r.subject === 'string' ? r.subject : undefined);
        const resolvedSubject = subjId ? subjectMap[subjId] || (subjObj ? { _id: subjId, name: subjObj.name } : undefined) : null;
        return {
          ...r,
          _id: r._id || r.id,
          subject: resolvedSubject,
          subjectId: subjId
        };
      });
      setAttendanceRecords(normalizedRecords);
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load your data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auth methods
  const register = async (userData) => {
    setLoading(true);
    try {
      const user = await authService.register(userData);
      const normalized = { ...user };
      if (normalized.id && !normalized._id) {
        normalized._id = normalized.id;
        delete normalized.id;
      }
      setCurrentUser(normalized);
      localStorage.setItem('currentUser', JSON.stringify(normalized));
      return { success: true };
    } catch (err) {
      console.error("Registration error:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Registration failed" 
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      const normalized = { ...userData };
      if (normalized.id && !normalized._id) {
        normalized._id = normalized.id;
        delete normalized.id;
      }
      setCurrentUser(normalized);
      localStorage.setItem('currentUser', JSON.stringify(normalized));
      return userData;
    } catch (err) {
      // Let the component handle the error
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Subject methods
  const addSubject = async (subjectName) => {
    setLoading(true);
    try {
      const newSubject = await subjectService.addSubject(currentUser._id, subjectName);
      setSubjects([...subjects, { _id: newSubject._id || newSubject.id, name: newSubject.name }]);
      return { success: true };
    } catch (err) {
      console.error("Error adding subject:", err);
      setError("Failed to add subject. Please try again.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

 const removeSubject = async (subjectId) => {
  setLoading(true);
  try {
    await subjectService.deleteSubject(subjectId, currentUser._id);
    
    // Remove subject locally
    setSubjects(subjects.filter(s => s._id !== subjectId));
    
    // Remove associated attendance records locally
    setAttendanceRecords(attendanceRecords.filter(record => record.subjectId !== subjectId && record.subject?._id !== subjectId));
    
    return { success: true };
  } catch (err) {
    console.error("Error removing subject:", err);
    setError("Failed to remove subject. Please try again.");
    return { success: false };
  } finally {
    setLoading(false);
  }
};


  // Attendance record methods
  const addAttendanceRecord = async (record) => {
    setLoading(true);
    try {
      // Find subject ID from name
      const subject = subjects.find(s => s.name === record.subject);
      if (!subject) {
        throw new Error("Subject not found");
      }
      
      const newRecord = await attendanceService.addRecord(
        currentUser._id,
        subject._id,
        record.status,
        record.date,
        record.classNumber // Add class number parameter
      );
      const normalized = {
        ...newRecord,
        _id: newRecord._id || newRecord.id,
        subject: subject,
        subjectId: subject._id
      };
      setAttendanceRecords([...attendanceRecords, normalized]);
      return { success: true };
    } catch (err) {
      console.error("Error adding attendance:", err);
      setError("Failed to add attendance record. Please try again.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceRecord = async (id, updatedRecord) => {
    setLoading(true);
    try {
      // Find subject ID from name if subject is being updated
      let subjectId;
      if (updatedRecord.subject) {
        const subject = subjects.find(s => s.name === updatedRecord.subject);
        if (!subject) {
          throw new Error("Subject not found");
        }
        subjectId = subject._id;
      }
      
      // Prepare record data for API
      const recordData = {
        ...updatedRecord,
        subjectId: subjectId || undefined
      };
      
      const updated = await attendanceService.updateRecord(id, recordData);
      const normalized = {
        ...updated,
        _id: updated._id || updated.id || id,
        subject: subjectId ? subjects.find(s => s._id === subjectId) : (updated.subject && typeof updated.subject === 'object' ? { _id: updated.subject._id || updated.subject.id, name: updated.subject.name } : attendanceRecords.find(r => r._id === id)?.subject),
        subjectId: subjectId || updated.subjectId || attendanceRecords.find(r => r._id === id)?.subjectId
      };
      setAttendanceRecords(attendanceRecords.map(r => r._id === id ? normalized : r));
      return { success: true };
    } catch (err) {
      console.error("Error updating attendance:", err);
      setError("Failed to update attendance record. Please try again.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteAttendanceRecord = async (id) => {
    setLoading(true);
    try {
      await attendanceService.deleteRecord(id);
      setAttendanceRecords(attendanceRecords.filter(record => record._id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting attendance:", err);
      setError("Failed to delete attendance record. Please try again.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    setLoading(true);
    try {
      await resetService.resetUserData(currentUser._id);
      setSubjects([]);
      setAttendanceRecords([]);
      return { success: true };
    } catch (err) {
      console.error("Error resetting data:", err);
      setError("Failed to reset data. Please try again.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Admin methods
  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const adminData = await adminService.login(email, password);
      const normalized = { ...adminData };
      if (normalized.id && !normalized._id) {
        normalized._id = normalized.id;
        delete normalized.id;
      }
      setCurrentUser({ ...normalized, isAdmin: true });
      localStorage.setItem('currentUser', JSON.stringify({ ...normalized, isAdmin: true }));
      return adminData;
    } catch (err) {
      // Let the component handle the error
      throw err;
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
    adminLogin, // Add this
    logout,
    addAttendanceRecord,
    updateAttendanceRecord,
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
