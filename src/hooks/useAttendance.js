import { useState, useEffect, useContext } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import api from '../utils/api';

const useAttendance = () => {
  const { attendanceRecords, setAttendanceRecords } = useContext(AttendanceContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const response = await api.get('/attendance');
        setAttendanceRecords(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [setAttendanceRecords]);

  const addAttendanceRecord = async (record) => {
    try {
      const response = await api.post('/attendance', record);
      setAttendanceRecords((prev) => [...prev, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const updateAttendanceRecord = async (id, updatedRecord) => {
    try {
      const response = await api.put(`/attendance/${id}`, updatedRecord);
      setAttendanceRecords((prev) =>
        prev.map((record) => (record.id === id ? response.data : record))
      );
    } catch (err) {
      setError(err);
    }
  };

  const deleteAttendanceRecord = async (id) => {
    try {
      await api.delete(`/attendance/${id}`);
      setAttendanceRecords((prev) => prev.filter((record) => record.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  return {
    attendanceRecords,
    loading,
    error,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
  };
};

export default useAttendance;