import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { adminService, resetService } from '../services/api';

function AdminDashboard() {
  const { logout } = useContext(AttendanceContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSubjects, setUserSubjects] = useState([]);
  const [userAttendance, setUserAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [daysToActivate, setDaysToActivate] = useState(30);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userPassword, setUserPassword] = useState('');

  // New: user status filter & email export panel
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Filters for attendance records
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const navigate = useNavigate();

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllUsers();
        // Normalize users data
        const normalizedUsers = response.map(user => ({
          ...user,
          _id: user._id || user.id,
          username: user.username || user.name,
          email: user.email,
          password: user.password,
          active: user.active,
          paidTill: user.paidTill
        }));
        setUsers(normalizedUsers);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRefreshUsers = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await adminService.getAllUsers();
      const normalizedUsers = response.map(user => ({
        ...user,
        _id: user._id || user.id,
        username: user.username || user.name,
        email: user.email,
        password: user.password,
        active: user.active,
        paidTill: user.paidTill
      }));
      setUsers(normalizedUsers);
      if (selectedUser) {
        const updatedSel = normalizedUsers.find(u => u._id === (selectedUser._id || selectedUser.id));
        if (updatedSel) setSelectedUser(updatedSel);
      }
    } catch (err) {
      setError('Failed to refresh users');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch user data when a user is selected
  useEffect(() => {
    if (!selectedUser) {
      setUserSubjects([]);
      setUserAttendance([]);
      setSubjectFilter('all');
      setFilterDate('');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subjects
        const subjects = await adminService.getUserSubjects(selectedUser._id);
        const normalizedSubjects = subjects.map(subject => ({
          _id: subject._id || subject.id,
          name: subject.name
        }));
        setUserSubjects(normalizedSubjects);

        const subjectMap = normalizedSubjects.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});

        // Fetch attendance
        const attendance = await adminService.getUserAttendance(selectedUser._id);
        const normalizedAttendance = attendance.map(r => {
          let resolvedSubject = null;
          let subjId = null;

          if (r.subject && typeof r.subject === 'object') {
            subjId = r.subject._id || r.subject.id;
            resolvedSubject = { _id: subjId, name: r.subject.name };
          } else if (typeof r.subject === 'string') {
            subjId = r.subject;
            resolvedSubject = subjectMap[subjId] || null;
          } else if (r.subjectId) {
            subjId = r.subjectId;
            resolvedSubject = subjectMap[subjId] || null;
          }

          if (!resolvedSubject && subjId) {
            resolvedSubject = subjectMap[subjId] || normalizedSubjects.find(s => s._id === subjId) || null;
          }

          return {
            ...r,
            _id: r._id || r.id,
            subject: resolvedSubject,
            subjectId: subjId,
            date: r.date,
            status: r.status,
            classNumber: r.classNumber || 1
          };
        });

        setUserAttendance(normalizedAttendance);
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedUser]);

  // Reset filters
  useEffect(() => {
    setSubjectFilter('all');
    setFilterDate('');
  }, [selectedUser?._id]);

  const handleUserSelect = (userId) => {
    const user = users.find(u => u._id === userId || u.id === userId);
    if (user) setSelectedUser({ ...user, _id: user._id || user.id });
    else setSelectedUser(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Copy emails
  const handleCopyAllEmails = () => {
    const emailsArr = Array.from(new Set(filteredUsers.map(u => u.email).filter(Boolean)));
    const emails = emailsArr.join(',');
    if (!emails) return alert('No filtered user emails available');

    navigator.clipboard.writeText(emails).then(() => {
      alert(`Copied ${emailsArr.length} filtered emails to clipboard`);
    }).catch(() => {
      window.prompt('Copy filtered emails (Ctrl+C):', emails);
    });
  };

  // Password sync
  useEffect(() => {
    if (selectedUser) {
      setUserPassword(selectedUser.password || '');
      setShowPassword(false);
    } else {
      setUserPassword('');
      setShowPassword(false);
    }
  }, [selectedUser?._id, selectedUser?.password]);

  // Actions
  const handleActivate = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Activate ${selectedUser.username} for ${daysToActivate} days?`)) return;

    setActionLoading(true);
    try {
      const updated = await adminService.activateUser(selectedUser._id, daysToActivate);
      const normalized = { ...updated, _id: updated._id || updated.id };
      setUsers(prev => prev.map(u => (u._id === normalized._id ? { ...u, ...normalized } : u)));
      setSelectedUser(prev => ({ ...(prev || {}), ...normalized }));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Deactivate ${selectedUser.username}? This revokes access immediately.`)) return;

    setActionLoading(true);
    try {
      const updated = await adminService.deactivateUser(selectedUser._id);
      const normalized = { ...updated, _id: updated._id || updated.id };
      setUsers(prev => prev.map(u => (u._id === normalized._id ? { ...u, ...normalized } : u)));
      setSelectedUser(prev => ({ ...(prev || {}), ...normalized }));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Permanently delete ${selectedUser.username}?`)) return;
    const confirm2 = window.prompt("Type DELETE to confirm permanent removal.");
    if (confirm2 !== 'DELETE') return;

    setActionLoading(true);
    try {
      await resetService.resetUserData(selectedUser._id);
      await adminService.deleteUser(selectedUser._id);
      setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
      setSelectedUser(null);
      alert('User deleted.');
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtering
  const filteredUsers = useMemo(() => {
    let data = [...users];
    if (userStatusFilter === 'active') data = data.filter(u => u.active);
    else if (userStatusFilter === 'inactive') data = data.filter(u => !u.active);

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(user =>
        user.username?.toLowerCase().includes(lowerQuery) ||
        user.email?.toLowerCase().includes(lowerQuery)
      );
    }
    return data;
  }, [users, searchQuery, userStatusFilter]);

  // Statistics
  const subjectStatistics = useMemo(() => {
    if (!userSubjects.length || !userAttendance.length) return [];

    return userSubjects.map(subject => {
      const subjectRecords = userAttendance.filter(record => {
        const recordSubjectId = record.subject?._id || record.subject?.id || record.subjectId;
        const subjectId = subject._id || subject.id;
        return recordSubjectId === subjectId;
      });

      let present = 0, absent = 0, totalHours = 0, attendedHours = 0;

      subjectRecords.forEach(record => {
        const hours = Number(record.classNumber) || 1;
        if (record.status === 'Present') { present += 1; attendedHours += hours; }
        else if (record.status === 'Absent') { absent += 1; }
        if (record.status !== 'No Class') totalHours += hours;
      });

      const percentage = totalHours > 0 ? Math.round((attendedHours / totalHours) * 100) : 0;

      return { ...subject, present, absent, totalHours, attendedHours, percentage };
    });
  }, [userSubjects, userAttendance]);

  // Options & filtering
  const subjectOptions = useMemo(() => {
    const names = (userSubjects || []).map(s => s.name).filter(Boolean);
    return Array.from(new Set(names));
  }, [userSubjects]);

  const filteredAttendance = useMemo(() => {
    let records = [...(userAttendance || [])];
    if (subjectFilter !== 'all') records = records.filter(r => r.subject?.name === subjectFilter);
    if (filterDate) {
      const target = new Date(filterDate).toISOString().split('T')[0];
      records = records.filter(r => new Date(r.date.split('T')[0]).toISOString().split('T')[0] === target);
    }
    return records;
  }, [userAttendance, subjectFilter, filterDate]);

  const sortedFilteredAttendance = useMemo(() => {
    return [...filteredAttendance].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredAttendance]);

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col font-sans text-light-primary">

      {/* Header */}
      <header className="glass-panel sticky top-0 z-30 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            AD
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white leading-none">Admin Command</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">SYSTEM OVERVIEW</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleRefreshUsers} disabled={refreshing} className="p-2 text-slate-400 hover:text-white transition-colors" title="Refresh Data">
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          <button onClick={handleLogout} className="text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider px-2">Logout</button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Sidebar: User List */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 h-[calc(100vh-140px)] sticky top-24">
          <div className="glass-panel p-4 rounded-3xl flex flex-col h-full overflow-hidden border border-white/5">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="font-bold text-lg text-white">Users</h2>
              <span className="text-xs font-bold bg-white/10 text-white px-2 py-1 rounded-full">{filteredUsers.length}</span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="relative">
                <svg className="absolute left-3 top-3 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Find user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button onClick={handleCopyAllEmails} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white" title="Copy Emails">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {loading && !users.length ? (
                <div className="text-center py-8 text-slate-500 text-sm">Loading database...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No users found.</div>
              ) : (
                filteredUsers.map(user => (
                  <button
                    key={user._id}
                    onClick={() => handleUserSelect(user._id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${selectedUser?._id === user._id
                        ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50'
                        : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold truncate ${selectedUser?._id === user._id ? 'text-white' : 'text-slate-200'}`}>{user.username}</span>
                      <div className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-500'}`}></div>
                    </div>
                    <div className={`text-xs truncate ${selectedUser?._id === user._id ? 'text-indigo-200' : 'text-slate-500'}`}>{user.email}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Content: Details */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 overflow-y-auto pb-20">
          {selectedUser ? (
            <>
              {error && <div className="p-4 bg-rose-500/10 border border-rose-500/50 text-rose-200 rounded-xl">{error}</div>}

              {/* User Overview Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Info Card */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedUser.username}</h2>
                    <p className="text-slate-400 font-mono text-sm">{selectedUser.email}</p>
                    <div className="mt-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${selectedUser.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                        {selectedUser.active ? 'Active Account' : 'Inactive'}
                      </span>
                      {selectedUser.paidTill && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          Paid: {new Date(selectedUser.paidTill).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">User Password</label>
                    <div className="flex gap-2">
                      <input type={showPassword ? "text" : "password"} value={userPassword} disabled className="flex-1 bg-slate-900/50 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono" />
                      <button onClick={() => setShowPassword(!showPassword)} className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 text-xs font-bold uppercase">
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions Card */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Quick Actions</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={daysToActivate}
                        onChange={(e) => setDaysToActivate(Number(e.target.value))}
                        className="w-20 bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-center text-white font-bold focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={handleActivate}
                        disabled={actionLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        Activate Access
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleDeactivate}
                        disabled={actionLoading}
                        className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 font-bold py-2 rounded-xl transition-all disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                      <button
                        onClick={handleDeleteUser}
                        disabled={actionLoading}
                        className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 font-bold py-2 rounded-xl transition-all disabled:opacity-50"
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-grids for data */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Subject Stats */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Academic Performance
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-slate-500 border-b border-white/5">
                          <th className="pb-3 pl-2 font-medium">Subject</th>
                          <th className="pb-3 font-medium text-center">Att</th>
                          <th className="pb-3 font-medium text-center">Abs</th>
                          <th className="pb-3 pr-2 font-medium text-right">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {subjectStatistics.length > 0 ? (
                          subjectStatistics.map(sub => (
                            <tr key={sub._id} className="group hover:bg-white/5 transition-colors">
                              <td className="py-3 pl-2 font-medium text-slate-200">{sub.name}</td>
                              <td className="py-3 text-center text-emerald-400 font-mono">{sub.attendedHours}</td>
                              <td className="py-3 text-center text-rose-400 font-mono">{sub.absent}</td>
                              <td className="py-3 pr-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${sub.percentage >= 75 ? 'bg-emerald-500' : sub.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${sub.percentage}%` }}></div>
                                  </div>
                                  <span className={`font-bold text-xs ${sub.percentage >= 75 ? 'text-emerald-400' : sub.percentage >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{sub.percentage}%</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" className="py-8 text-center text-slate-500 italic">No academic data available</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attendance Log */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5">
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span> Attendance Log
                    </h3>
                    <div className="flex max-w-[200px] gap-2">
                      <select
                        className="bg-slate-900/50 border-none rounded-lg text-xs text-slate-300 py-1"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                      >
                        <option value="all">All Subs</option>
                        {subjectOptions.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <input
                        type="date"
                        className="bg-slate-900/50 border-none rounded-lg text-xs text-slate-300 py-1 w-28"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                    <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-white/5">
                        {sortedFilteredAttendance.length > 0 ? (
                          sortedFilteredAttendance.map(record => (
                            <tr key={record._id} className="group hover:bg-white/5 transition-colors">
                              <td className="py-3 pl-2">
                                <div className="font-medium text-slate-200">{record.subject?.name || 'Unknown'}</div>
                                <div className="text-[10px] text-slate-500">{new Date(record.date).toLocaleDateString()}</div>
                              </td>
                              <td className="py-3 text-right pr-2">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' :
                                    record.status === 'Absent' ? 'bg-rose-500/10 text-rose-400' :
                                      'bg-slate-500/10 text-slate-400'
                                  }`}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="2" className="py-8 text-center text-slate-500 italic">No matching records</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
              <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="text-lg font-medium">Select a user to view details</p>
              <p className="text-sm opacity-60">Manage permissions, subjects, and attendance</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
