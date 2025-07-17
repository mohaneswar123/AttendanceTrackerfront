import React, { useContext } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';

function AttendanceList() {
  const { attendanceRecords, deleteRecord } = useContext(AttendanceContext);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold">Attendance Records</h2>
      <ul className="mt-2">
        {attendanceRecords.map((record) => (
          <li key={record.id} className="flex justify-between items-center p-2 border-b">
            <span>{`${record.date} - ${record.subject}: ${record.status}`}</span>
            <button
              onClick={() => deleteRecord(record.id)}
              className="text-red-500 hover:text-red-700"
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