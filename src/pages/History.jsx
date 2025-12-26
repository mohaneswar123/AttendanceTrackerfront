import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

function History() {
  const {
    currentUser,
    attendanceRecords,
    deleteAttendanceRecord,
    subjects
  } = useContext(AttendanceContext);

  // Filters
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const subjectOptions = useMemo(() => {
    const names = (subjects || []).map(s => s.name).filter(Boolean);
    return Array.from(new Set(names));
  }, [subjects]);

  // Apply filters & Grouping
  const groupedRecords = useMemo(() => {
    let records = [...(attendanceRecords || [])];

    if (subjectFilter !== 'all') {
      records = records.filter(r => {
        const subjName = r.subject?.name || r.subject || (subjects?.find?.(s => s._id === r.subjectId)?.name);
        return subjName === subjectFilter;
      });
    }

    if (filterDate) {
      const target = typeof filterDate === 'string' ? filterDate : new Date(filterDate).toISOString().split('T')[0];
      records = records.filter(r => {
        const recDate = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
        return recDate === target;
      });
    }

    // Sort by date desc
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group by Date
    const groups = {};
    records.forEach(record => {
      const dateObj = new Date(record.date);
      const dateKey = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(record);
    });

    return groups;
  }, [attendanceRecords, subjectFilter, filterDate, subjects]);

  const handleDelete = (id) => {
    if (!currentUser) return;
    if (confirm('Delete this record?')) {
      deleteAttendanceRecord(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">History Log</h1>
          <p className="text-slate-400">Track your class attendance timeline.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:border-primary-500 outline-none"
          >
            <option value="all">All Subjects</option>
            {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {!currentUser && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex gap-3">
          <span className="text-lg">🔒</span>
          <div>Guest Mode. <Link to="/login" className="font-bold underline">Login</Link> to manage records.</div>
        </div>
      )}

      {/* Timeline Feed */}
      <div className="relative space-y-8">
        {/* Vertical Line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary-500/50 via-secondary-500/50 to-transparent hidden md:block" />

        {Object.keys(groupedRecords).length > 0 ? (
          Object.entries(groupedRecords).map(([date, records], groupIndex) => (
            <div key={date} className="relative animate-fade-in" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-primary-500/50 flex items-center justify-center z-10 hidden md:flex">
                  <div className="w-3 h-3 rounded-full bg-primary-400" />
                </div>
                <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  {date}
                </h2>
              </div>

              {/* Records Grid */}
              <div className="md:ml-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map((record) => (
                  <div
                    key={record._id}
                    className="glass-card hover:bg-white/5 transition-all p-4 border-l-4 group relative overflow-hidden"
                    style={{
                      borderLeftColor: record.status === 'Present' ? '#10b981' : record.status === 'Absent' ? '#f43f5e' : '#64748b'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-lg">{record.subject?.name || record.subject}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium uppercase tracking-wider">
                          <span>Class {record.classNumber}</span>
                          <span>•</span>
                          <span className={
                            record.status === 'Present' ? 'text-emerald-400' :
                              record.status === 'Absent' ? 'text-rose-400' : 'text-slate-400'
                          }>{record.status}</span>
                        </div>
                      </div>

                      {currentUser && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(record._id);
                          }}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors md:opacity-0 md:group-hover:opacity-100 opacity-100 relative z-10 cursor-pointer"
                          title="Delete Record"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-white">No records found</h3>
            <p className="text-slate-400">Try adjusting the filters or record some classes.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
