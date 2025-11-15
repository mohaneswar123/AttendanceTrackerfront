import React, { useContext } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';

function AttendanceList() {
  const { attendanceRecords, deleteAttendanceRecord } = useContext(AttendanceContext);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold text-light-primary">Attendance Records</h2>
      <ul className="mt-2">
        {attendanceRecords.map((record) => (
          <li key={record._id} className="flex justify-between items-center p-2 border-b border-dark-secondary">
            <span className="text-light-primary">{`${record.date} - ${record.subject?.name || record.subject}: ${record.status}`}</span>
            <button
              onClick={() => deleteAttendanceRecord(record._id)}
              className="text-red-400 hover:text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AttendanceList;