import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import MarkAttendance from '../components/attendance/MarkAttendance';
import AttendanceHistory from '../components/attendance/AttendanceHistory';
import AttendanceReports from '../components/attendance/AttendanceReports';
import SubjectManager from '../components/attendance/SubjectManager';

// One page, four sections. Each keeps its own address so links and the back button work.
export const TABS = [
  { key: 'mark', label: 'Record', path: '/', subtitle: "Record today's classes." },
  { key: 'history', label: 'History', path: '/history', subtitle: 'Every class you have recorded.' },
  { key: 'reports', label: 'Reports', path: '/reports', subtitle: 'How your percentage is holding up.' },
  { key: 'subjects', label: 'Subjects', path: '/subjects', subtitle: 'What attendance is recorded against.' }
];

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

function Attendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useContext(AttendanceContext);
  const online = useOnlineStatus();

  const tab = TABS.find(t => t.path === location.pathname) || TABS[0];
  const go = (key) => navigate(TABS.find(t => t.key === key).path);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{tab.subtitle}</p>
        </div>
        {currentUser && !online && <span className="badge badge-warning shrink-0">Offline</span>}
      </div>

      <div className="segmented grid grid-cols-4 sm:inline-flex w-full sm:w-auto" role="tablist" aria-label="Attendance sections">
        {TABS.map(option => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={tab.key === option.key}
            onClick={() => go(option.key)}
            className="segmented-item"
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab.key === 'mark' && (
        <MarkAttendance onViewHistory={() => go('history')} onAddSubject={() => go('subjects')} />
      )}
      {tab.key === 'history' && <AttendanceHistory />}
      {tab.key === 'reports' && <AttendanceReports onAddSubject={() => go('subjects')} />}
      {tab.key === 'subjects' && <SubjectManager autoFocus />}
    </div>
  );
}

export default Attendance;
