import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

function Report() {
  const { currentUser, subjects, attendanceRecords } = useContext(AttendanceContext);

  // Derive subjects from records if empty
  const derivedSubjects = useMemo(() => {
    if (subjects && subjects.length > 0) return subjects;
    const unique = new Map();
    attendanceRecords.forEach(record => {
      const subjObj = record.subject;
      if (typeof subjObj === 'object' && subjObj !== null) {
        if (!unique.has(subjObj.name)) unique.set(subjObj.name, { _id: subjObj._id || subjObj.id || subjObj.name, name: subjObj.name });
      } else if (typeof subjObj === 'string' && subjObj.trim() !== '') {
        if (!unique.has(subjObj)) unique.set(subjObj, { _id: subjObj, name: subjObj });
      }
    });
    return Array.from(unique.values());
  }, [subjects, attendanceRecords]);

  // Calculate stats
  const statistics = useMemo(() => {
    const stats = {};
    derivedSubjects.forEach(subject => {
      stats[subject.name] = { present: 0, absent: 0, noClass: 0, totalHours: 0, totalAttendedHours: 0, missedHours: 0, percentage: 0 };
    });

    attendanceRecords.forEach(record => {
      const subjectName = record.subject?.name || record.subject || (subjects.find(s => s._id === record.subjectId)?.name);
      if (!subjectName) return;

      const hours = Number(record.classNumber) || 1;
      if (!stats[subjectName]) stats[subjectName] = { present: 0, absent: 0, noClass: 0, totalHours: 0, totalAttendedHours: 0, missedHours: 0, percentage: 0 };

      if (record.status === 'Present') {
        stats[subjectName].present += 1;
        stats[subjectName].totalAttendedHours += hours;
      } else if (record.status === 'Absent') {
        stats[subjectName].absent += 1;
        stats[subjectName].missedHours += hours;
      } else if (record.status === 'No Class') {
        stats[subjectName].noClass += 1;
      }

      if (record.status !== 'No Class') {
        stats[subjectName].totalHours += hours;
      }
    });

    Object.keys(stats).forEach(name => {
      const s = stats[name];
      s.percentage = s.totalHours > 0 ? Math.round((s.totalAttendedHours / s.totalHours) * 100) : 0;
    });
    return stats;
  }, [derivedSubjects, attendanceRecords]);

  // Overall stats
  const overallStats = useMemo(() => {
    let totalAttended = 0, totalHours = 0, totalMissed = 0;
    Object.values(statistics).forEach(stat => {
      totalAttended += stat.totalAttendedHours;
      totalMissed += stat.missedHours;
      totalHours += stat.totalHours;
    });
    const avg = totalHours > 0 ? Math.round((totalAttended / totalHours) * 100) : 0;
    return { totalAttended, totalMissed, totalHours, avg };
  }, [statistics]);

  const getStatusColor = (pct) => {
    if (pct >= 75) return 'text-emerald-400';
    if (pct >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getStatusBg = (pct) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-slate-400">Detailed performance report.</p>
        </div>
        <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print
        </button>
      </div>

      {derivedSubjects.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/5 text-center">
          <h3 className="text-xl text-white font-bold mb-2">No Data Available</h3>
          <p className="text-slate-400">Add subjects or start recording attendance to see reports.</p>
        </div>
      ) : (
        <>
          {/* Main Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Circular Progress Card */}
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10 text-center">
                <div className="w-48 h-48 relative flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                      strokeDasharray={2 * Math.PI * 88}
                      strokeDashoffset={2 * Math.PI * 88 * (1 - overallStats.avg / 100)}
                      className={`${getStatusColor(overallStats.avg)} transition-all duration-1000 ease-out`}
                      style={{ strokeLinecap: 'round' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${getStatusColor(overallStats.avg)}`}>{overallStats.avg}%</span>
                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mt-1">Overall</span>
                  </div>
                </div>
                <div className="flex gap-8 justify-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{overallStats.totalAttended}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Hours Present</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-400">{overallStats.totalHours}</div>
                    <div className="text-xs text-slate-600 uppercase font-bold">Total Hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of Subject Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {derivedSubjects.map(subject => {
                const stat = statistics[subject.name] || { percentage: 0 };
                return (
                  <div key={subject.name} className="glass-card p-5 rounded-2xl flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg truncate w-32 md:w-40">{subject.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{stat.totalAttendedHours} / {stat.totalHours} Hours</p>
                      </div>
                      <div className={`text-xl font-bold ${getStatusColor(stat.percentage)}`}>
                        {stat.percentage}%
                      </div>
                    </div>

                    {/* Mini Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getStatusBg(stat.percentage)}`} style={{ width: `${stat.percentage}%` }} />
                    </div>

                    <div className="mt-4 flex justify-between text-xs font-semibold">
                      <span className="text-emerald-400">{stat.present} Present</span>
                      <span className="text-rose-400">{stat.absent} Absent</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Report;
