import React, { useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import PageHeader, { HeaderButton } from '../components/PageHeader';
import Tabs from '../components/Tabs';
import ThemeToggle from '../components/ThemeToggle';
import { SettingsIcon } from '../components/icons';
import MarkAttendance from '../components/attendance/MarkAttendance';
import AttendanceSummary from '../components/attendance/AttendanceSummary';
import AttendanceHistory from '../components/attendance/AttendanceHistory';
import AttendanceReports from '../components/attendance/AttendanceReports';
import SubjectManager from '../components/attendance/SubjectManager';
import { longWeekday, tally } from '../utils/attendance';
import { todayLocal } from '../utils/date';

// One page, four sections. Each keeps its own address so links and the back button work.
export const TABS = [
  { key: 'mark', label: 'Record', path: '/' },
  { key: 'history', label: 'History', path: '/history' },
  { key: 'reports', label: 'Reports', path: '/reports' },
  { key: 'subjects', label: 'Subjects', path: '/subjects' }
];

function Attendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { attendanceRecords } = useContext(AttendanceContext);

  const tab = TABS.find(t => t.path === location.pathname) || TABS[0];
  const go = (key) => navigate(TABS.find(t => t.key === key).path);
  const today = todayLocal();

  const totals = useMemo(() => tally(attendanceRecords), [attendanceRecords]);
  const todayCount = useMemo(
    () => attendanceRecords.filter(record => String(record.date).slice(0, 10) === today).length,
    [attendanceRecords, today]
  );

  return (
    <div className="space-y-4">
      <PageHeader eyebrow={longWeekday(today)} title="Attendance">
        <ThemeToggle compact />
        <HeaderButton label="Settings" onClick={() => navigate('/settings')}>
          <SettingsIcon />
        </HeaderButton>
      </PageHeader>

      <Tabs
        label="Attendance sections"
        items={TABS.map(t => ({ value: t.key, label: t.label }))}
        value={tab.key}
        onChange={go}
      />

      {/* Record is only for recording. The figures live under Reports. */}
      {tab.key === 'mark' && (
        <div className="md:max-w-xl">
          <MarkAttendance onAddSubject={() => go('subjects')} />
        </div>
      )}
      {tab.key === 'history' && <AttendanceHistory />}
      {tab.key === 'reports' && (
        <div className="space-y-4">
          <AttendanceSummary totals={totals} todayCount={todayCount} />
          <AttendanceReports onAddSubject={() => go('subjects')} />
        </div>
      )}
      {tab.key === 'subjects' && <SubjectManager autoFocus />}
    </div>
  );
}

export default Attendance;
