import React, { useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import PageHeader, { HeaderButton } from '../components/PageHeader';
import Tabs from '../components/Tabs';
import ThemeToggle from '../components/ThemeToggle';
import { SettingsIcon } from '../components/icons';
import MarkAttendance from '../components/attendance/MarkAttendance';
import AttendanceSummary from '../components/attendance/AttendanceSummary';
import SubjectProgressList from '../components/attendance/SubjectProgressList';
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
  const { subjects, attendanceRecords } = useContext(AttendanceContext);

  const tab = TABS.find(t => t.path === location.pathname) || TABS[0];
  const go = (key) => navigate(TABS.find(t => t.key === key).path);
  const today = todayLocal();

  const totals = useMemo(() => tally(attendanceRecords), [attendanceRecords]);
  const todayCount = useMemo(
    () => attendanceRecords.filter(record => String(record.date).slice(0, 10) === today).length,
    [attendanceRecords, today]
  );

  const subjectRows = useMemo(() => subjects.map(subject => {
    const records = attendanceRecords.filter(record =>
      (record.subject?._id || record.subject?.id || record.subjectId) === subject._id);
    return { ...subject, ...tally(records) };
  }), [subjects, attendanceRecords]);

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

      {tab.key === 'mark' && (
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:items-start">
          <div className="space-y-4">
            <AttendanceSummary totals={totals} todayCount={todayCount} />
            <SubjectProgressList
              subjects={subjectRows.map(row => ({ ...row, percentage: row.percentage ?? 0 }))}
              onAdd={() => go('subjects')}
            />
          </div>
          <MarkAttendance onAddSubject={() => go('subjects')} />
        </div>
      )}
      {tab.key === 'history' && <AttendanceHistory />}
      {tab.key === 'reports' && <AttendanceReports onAddSubject={() => go('subjects')} />}
      {tab.key === 'subjects' && <SubjectManager autoFocus />}
    </div>
  );
}

export default Attendance;
