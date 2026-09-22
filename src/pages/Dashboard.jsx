import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { todayLocal } from '../utils/date';

const hoursLabel = (hours) => `${hours} ${Number(hours) === 1 ? 'hr' : 'hrs'}`;

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

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, subjects, attendanceRecords, addAttendanceRecord } = useContext(AttendanceContext);
  const online = useOnlineStatus();

  const [formData, setFormData] = useState({
    subjectId: subjects[0]?._id || '',
    date: todayLocal(),
    status: 'Present',
    classNumber: 1 // class length in hours
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Keep a valid subject selected as subjects load or get deleted
  useEffect(() => {
    if (!subjects.some(s => s._id === formData.subjectId)) {
      setFormData(prev => ({ ...prev, subjectId: subjects[0]?._id || '' }));
    }
  }, [subjects, formData.subjectId]);

  // Clear the message a few seconds after it appears
  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentUser) {
      setMessage({ text: '⚠️ Login required.', type: 'error' });
      return;
    }
    const subject = subjects.find(s => s._id === formData.subjectId);
    if (!subject) {
      setMessage({ text: 'Add a subject in Settings first.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const result = await addAttendanceRecord(formData);
    setIsSubmitting(false);

    if (result.success) {
      setMessage({ text: `Success! Recorded ${subject.name}.`, type: 'success' });
      setFormData(prev => ({ ...prev, status: 'Present' }));
    } else {
      setMessage({ text: result.message || 'Failed to record.', type: 'error' });
    }
  };

  const displayName = currentUser?.username || currentUser?.name || 'Guest';
  const recentActivity = attendanceRecords.slice().reverse().slice(0, 5); // Last 5 records

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400"> {displayName}</span>
          </h1>
          <p className="text-slate-400 mt-1">Ready to track today's classes?</p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3">
            {online ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Offline
              </div>
            )}
            <button onClick={() => navigate('/settings')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* 2. Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Attendance Form (Span 2) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Action Card */}
          <div className="glass-card p-1 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="bg-background-paper/90 backdrop-blur-xl rounded-[20px] p-6 md:p-8 border border-white/5 relative z-10 h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-primary-500/20 text-primary-400">📝</span>
                    Record Attendance
                  </h2>
                </div>
                {isSubmitting && <span className="text-xs text-primary-400 animate-pulse">Syncing...</span>}
              </div>

              {!currentUser && (
                <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm flex gap-3">
                  <span className="text-lg">🔒</span>
                  <div>Guest Mode. <Link to="/login" className="font-bold underline">Login</Link> to save data.</div>
                </div>
              )}

              {message.text && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center shadow-lg animate-fade-in ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <span className="mr-2 text-xl">{message.type === 'success' ? '🎉' : '⚠️'}</span>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Subject</label>
                    <select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                      disabled={!currentUser || subjects.length === 0}
                    >
                      {subjects.length === 0 && <option value="">No Subjects</option>}
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Present', 'Absent', 'No Class'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, status }))}
                          className={`py-3 rounded-xl text-sm font-medium transition-all border ${formData.status === status
                              ? status === 'Present' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                : status === 'Absent' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                                  : 'bg-slate-600 text-white border-slate-500'
                              : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800'
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>

                  {/* Class length */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Duration (hours)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, classNumber: num }))}
                          className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.classNumber === num
                              ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                              : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800'
                            }`}
                        >
                          {num}h
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !currentUser}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Recording...' : 'Record Attendance ✨'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity (Span 1) */}
        <div className="space-y-6">

          {/* Recent Activity Card */}
          <div className="glass-panel p-6 rounded-3xl h-full border-t border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Recent Activity</span>
              <Link to="/history" className="text-xs text-primary-400 hover:text-primary-300">View All</Link>
            </h3>

            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map(record => (
                  <div key={record._id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' :
                        record.status === 'Absent' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-600/20 text-slate-400'
                      }`}>
                      {record.status === 'Present' ? 'P' : record.status === 'Absent' ? 'A' : '-'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-200 truncate">{record.subject?.name || 'Unknown subject'}</h4>
                      <p className="text-xs text-slate-500">{record.date} • {hoursLabel(record.classNumber)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No recent activity.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
