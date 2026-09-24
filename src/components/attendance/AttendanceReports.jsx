import React, { useContext, useMemo } from 'react';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import { PrinterIcon } from '../icons';

// Percentages are weighted by class length: a 2-hour class counts twice a 1-hour one,
// and "No Class" doesn't count at all.
function AttendanceReports({ onAddSubject }) {
  const { subjects, attendanceRecords } = useContext(AttendanceContext);

  // Fall back to the subjects named by the records themselves
  const derivedSubjects = useMemo(() => {
    if (subjects && subjects.length > 0) return subjects;
    const unique = new Map();
    attendanceRecords.forEach(record => {
      const value = record.subject;
      if (value && typeof value === 'object') {
        if (!unique.has(value.name)) unique.set(value.name, { _id: value._id || value.id || value.name, name: value.name });
      } else if (typeof value === 'string' && value.trim() !== '') {
        if (!unique.has(value)) unique.set(value, { _id: value, name: value });
      }
    });
    return Array.from(unique.values());
  }, [subjects, attendanceRecords]);

  const statistics = useMemo(() => {
    const blank = () => ({ present: 0, absent: 0, noClass: 0, totalHours: 0, attendedHours: 0, percentage: 0 });
    const stats = {};
    derivedSubjects.forEach(subject => { stats[subject.name] = blank(); });

    attendanceRecords.forEach(record => {
      const name = record.subject?.name || record.subject || subjects.find(s => s._id === record.subjectId)?.name;
      if (!name) return;
      const hours = Number(record.classNumber) || 1;
      stats[name] ||= blank();

      if (record.status === 'Present') {
        stats[name].present += 1;
        stats[name].attendedHours += hours;
      } else if (record.status === 'Absent') {
        stats[name].absent += 1;
      } else if (record.status === 'No Class') {
        stats[name].noClass += 1;
      }
      if (record.status !== 'No Class') stats[name].totalHours += hours;
    });

    Object.values(stats).forEach(s => {
      s.percentage = s.totalHours > 0 ? Math.round((s.attendedHours / s.totalHours) * 100) : 0;
    });
    return stats;
  }, [derivedSubjects, attendanceRecords, subjects]);

  const overall = useMemo(() => {
    let attendedHours = 0, totalHours = 0;
    Object.values(statistics).forEach(stat => {
      attendedHours += stat.attendedHours;
      totalHours += stat.totalHours;
    });
    return {
      attendedHours,
      totalHours,
      percentage: totalHours > 0 ? Math.round((attendedHours / totalHours) * 100) : 0
    };
  }, [statistics]);

  const tone = (pct) => (pct >= 75 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400');
  const barTone = (pct) => (pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500');

  if (derivedSubjects.length === 0) {
    return (
      <div className="surface p-10 text-center">
        <h2 className="font-semibold text-white">Nothing to report yet</h2>
        <p className="text-sm text-slate-400 mt-1 mb-5">Add a subject and record a class or two.</p>
        <button onClick={onAddSubject} className="btn btn-primary px-5">Add a subject</button>
      </div>
    );
  }

  const stat = (label, value, className = 'text-white') => (
    <div className="surface p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 tabular-nums ${className}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {stat('Overall', `${overall.percentage}%`, tone(overall.percentage))}
        {stat('Hours attended', overall.attendedHours)}
        {stat('Hours counted', overall.totalHours, 'text-slate-300')}
      </div>

      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-line">
          <h2 className="text-sm font-semibold text-white">By subject</h2>
          <button onClick={() => window.print()} className="hidden md:inline-flex btn btn-ghost px-2">
            <PrinterIcon className="w-4 h-4" />
            Print
          </button>
        </div>

        <ul className="divide-y divide-line">
          {derivedSubjects.map(subject => {
            const s = statistics[subject.name] || { percentage: 0, attendedHours: 0, totalHours: 0, present: 0, absent: 0 };
            return (
              <li key={subject.name} className="px-4 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-slate-100 truncate">{subject.name}</span>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${tone(s.percentage)}`}>{s.percentage}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${barTone(s.percentage)}`} style={{ width: `${s.percentage}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {s.attendedHours} of {s.totalHours} hours · {s.present} present · {s.absent} absent
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default AttendanceReports;
