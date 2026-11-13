import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FeatureShell from '../components/FeatureShell';
import MarkAttendance from '../components/attendance/MarkAttendance';
import AttendanceHistory from '../components/attendance/AttendanceHistory';
import AttendanceReports from '../components/attendance/AttendanceReports';
import SubjectManager from '../components/attendance/SubjectManager';
import PlanEditor from '../components/attendance/PlanEditor';
import useAttendancePlan from '../hooks/useAttendancePlan';

// One page, four sections. Each keeps its own address so links and the back button work.
export const TABS = [
  { key: 'mark', label: 'Record', path: '/attendance' },
  { key: 'history', label: 'History', path: '/attendance/history' },
  { key: 'reports', label: 'Reports', path: '/attendance/reports' },
  { key: 'subjects', label: 'Subjects', path: '/attendance/subjects' },
  { key: 'plan', label: 'Plan', path: '/attendance/plan' }
];

function Attendance() {
  const navigate = useNavigate();
  const location = useLocation();
  // Fetched once for the page: Record reads it, Plan edits it
  const weeklyPlan = useAttendancePlan();

  const tab = TABS.find(t => t.path === location.pathname) || TABS[0];
  const go = (key) => navigate(TABS.find(t => t.key === key).path);

  return (
    <FeatureShell
      // Recording is what the + is for; Reports and Plan have nothing it could add
      onAdd={tab.key === 'reports' || tab.key === 'plan' ? undefined : () => go('mark')}
    >
      {/* Record is only for recording. The figures live under Reports. */}
      {tab.key === 'mark' && (
        <div className="md:max-w-xl">
          <MarkAttendance onAddSubject={() => go('subjects')} plan={weeklyPlan.plan} />
        </div>
      )}
      {tab.key === 'history' && <AttendanceHistory />}
      {tab.key === 'reports' && <AttendanceReports />}
      {tab.key === 'subjects' && <SubjectManager autoFocus />}
      {tab.key === 'plan' && (
        <PlanEditor
          plan={weeklyPlan.plan}
          saving={weeklyPlan.saving}
          error={weeklyPlan.error}
          onSaveDay={weeklyPlan.saveDay}
        />
      )}
    </FeatureShell>
  );
}

export default Attendance;
