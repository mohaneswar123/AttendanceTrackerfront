import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FeatureShell from '../components/FeatureShell';
import MarkAttendance from '../components/attendance/MarkAttendance';
import AttendanceHistory from '../components/attendance/AttendanceHistory';
import AttendanceReports from '../components/attendance/AttendanceReports';
import PeriodSelect from '../components/attendance/PeriodSelect';
import SubjectManager from '../components/attendance/SubjectManager';

// One page, four sections. Each keeps its own address so links and the back button work.
export const TABS = [
  { key: 'mark', label: 'Record', path: '/attendance' },
  { key: 'history', label: 'History', path: '/attendance/history' },
  { key: 'reports', label: 'Reports', path: '/attendance/reports' },
  { key: 'subjects', label: 'Subjects', path: '/attendance/subjects' }
];

function Attendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [period, setPeriod] = useState('term');

  const tab = TABS.find(t => t.path === location.pathname) || TABS[0];
  const go = (key) => navigate(TABS.find(t => t.key === key).path);

  return (
    <FeatureShell
      // Recording is what the + is for, and Reports has the period picker instead
      onAdd={tab.key === 'reports' ? undefined : () => go('mark')}
      actions={tab.key === 'reports' ? <PeriodSelect value={period} onChange={setPeriod} /> : null}
    >
      {/* Record is only for recording. The figures live under Reports. */}
      {tab.key === 'mark' && (
        <div className="md:max-w-xl">
          <MarkAttendance onAddSubject={() => go('subjects')} />
        </div>
      )}
      {tab.key === 'history' && <AttendanceHistory />}
      {tab.key === 'reports' && <AttendanceReports period={period} />}
      {tab.key === 'subjects' && <SubjectManager autoFocus />}
    </FeatureShell>
  );
}

export default Attendance;
