import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { adminService } from '../services/api';

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
  // Filters for attendance records (like History page)
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const navigate = useNavigate();

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllUsers();
        console.log('Raw users response:', response);
        
        // Normalize users data to ensure _id field exists
        const normalizedUsers = response.map(user => ({
          ...user,
          _id: user._id || user.id,
          username: user.username || user.name,
          email: user.email,
          password: user.password,
          active: user.active,
          paidTill: user.paidTill
        }));
        
        console.log('Normalized users:', normalizedUsers);
        setUsers(normalizedUsers);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error fetching users:', err);
        console.error('Error details:', err.response?.data);
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
      // if selected user exists, update it with latest data
      if (selectedUser) {
        const updatedSel = normalizedUsers.find(u => u._id === (selectedUser._id || selectedUser.id));
        if (updatedSel) setSelectedUser(updatedSel);
      }
    } catch (err) {
      setError('Failed to refresh users');
      console.error('Error refreshing users:', err);
      console.error('Error details:', err.response?.data);
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
        
        console.log('Fetching data for user:', selectedUser._id);
        
        // Fetch subjects for selected user
        const subjects = await adminService.getUserSubjects(selectedUser._id);
        console.log('Fetched subjects:', subjects);
        
        // Normalize subjects data
        const normalizedSubjects = subjects.map(subject => ({
          _id: subject._id || subject.id,
          name: subject.name
        }));
        setUserSubjects(normalizedSubjects);
        
        // Create subject map for attendance normalization
        const subjectMap = normalizedSubjects.reduce((acc, s) => { 
          acc[s._id] = s; 
          return acc; 
        }, {});
        
        // Fetch attendance records for selected user
        const attendance = await adminService.getUserAttendance(selectedUser._id);
        console.log('Fetched attendance:', attendance);
        
        // Normalize attendance data with subject references
        const normalizedAttendance = attendance.map(r => {
          // Handle different subject reference formats
          let resolvedSubject = null;
          let subjId = null;
          
          if (r.subject && typeof r.subject === 'object') {
            // Subject is already populated as an object
            subjId = r.subject._id || r.subject.id;
            resolvedSubject = {
              _id: subjId,
              name: r.subject.name
            };
          } else if (typeof r.subject === 'string') {
            // Subject is just an ID string
            subjId = r.subject;
            resolvedSubject = subjectMap[subjId] || null;
          } else if (r.subjectId) {
            // Subject ID is in separate field
            subjId = r.subjectId;
            resolvedSubject = subjectMap[subjId] || null;
          }
          
          // Fallback: try to find subject by ID in our subject map
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
        console.log('Normalized attendance:', normalizedAttendance);
        console.log('Subject map:', subjectMap);
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error fetching user data:', err);
        console.error('Error details:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedUser]);

  // Reset filters when subject list changes (new user selected)
  useEffect(() => {
    setSubjectFilter('all');
    setFilterDate('');
  }, [selectedUser?._id]);

  const handleUserSelect = (userId) => {
    console.log('User selected - ID:', userId);
    console.log('Available users:', users);
    
    const user = users.find(u => u._id === userId || u.id === userId);
    console.log('Found user:', user);
    
    if (user) {
      setSelectedUser({
        ...user,
        _id: user._id || user.id
      });
    } else {
      console.error('User not found with ID:', userId);
      setSelectedUser(null);
    }
  };

  const handleLogout = () => {
    logout(); // Use the existing logout function
    navigate('/admin/login');
  };

  // When selected user changes, seed password from user data (no extra API)
  useEffect(() => {
    if (selectedUser) {
      setUserPassword(selectedUser.password || '');
      setShowPassword(false);
    } else {
      setUserPassword('');
      setShowPassword(false);
    }
  }, [selectedUser?._id, selectedUser?.password]);

  // Activate selected user
  const handleActivate = async () => {
    if (!selectedUser) return;
    try {
      const confirm1 = window.confirm(`Activate ${selectedUser.username || 'this user'} for ${daysToActivate || 30} days?`);
      if (!confirm1) return;
      const confirm2 = window.confirm('Please confirm activation. Proceed?');
      if (!confirm2) return;
      setActionLoading(true);
      const updated = await adminService.activateUser(selectedUser._id, daysToActivate || 30);
      // reflect changes in users list and selectedUser
      const normalized = { ...updated, _id: updated._id || updated.id };
      setUsers(prev => prev.map(u => (u._id === normalized._id ? { ...u, ...normalized } : u)));
      setSelectedUser(prev => ({ ...(prev || {}), ...normalized }));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  // Deactivate selected user
  const handleDeactivate = async () => {
    if (!selectedUser) return;
    try {
      const confirm1 = window.confirm(`Deactivate ${selectedUser.username || 'this user'}?`);
      if (!confirm1) return;
      const confirm2 = window.confirm('This will immediately revoke access. Proceed?');
      if (!confirm2) return;
      setActionLoading(true);
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

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(user => 
      user.username?.toLowerCase().includes(lowerQuery) || 
      user.email?.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  // Calculate attendance statistics for each subject of the selected user
  const subjectStatistics = useMemo(() => {
    if (!userSubjects.length || !userAttendance.length) return [];
    
    console.log('Calculating statistics for subjects:', userSubjects);
    console.log('Using attendance records:', userAttendance);
    
    const statistics = userSubjects.map(subject => {
      // Filter attendance records for this subject - check multiple possible ID fields
      const subjectRecords = userAttendance.filter(record => {
        const recordSubjectId = record.subject?._id || record.subject?.id || record.subjectId;
        const subjectId = subject._id || subject.id;
        return recordSubjectId === subjectId;
      });
      
      console.log(`Records for ${subject.name}:`, subjectRecords);
      
      // Count present, absent, and calculate hours
      let present = 0;
      let absent = 0;
      let totalHours = 0;
      let attendedHours = 0;
      
      subjectRecords.forEach(record => {
        const hours = Number(record.classNumber) || 1;
        
        if (record.status === 'Present') {
          present += 1;
          attendedHours += hours;
        } else if (record.status === 'Absent') {
          absent += 1;
        }
        
        // Only count Present and Absent towards total (not No Class)
        if (record.status !== 'No Class') {
          totalHours += hours;
        }
      });
      
      // Calculate percentage based on hours
      const percentage = totalHours > 0 ? Math.round((attendedHours / totalHours) * 100) : 0;
      
      return {
        ...subject,
        present,
        absent,
        totalHours,
        attendedHours,
        percentage
      };
    });
    
    console.log('Calculated statistics:', statistics);
    return statistics;
  }, [userSubjects, userAttendance]);

  // Subject options for filter (from selected user's subjects)
  const subjectOptions = useMemo(() => {
    const names = (userSubjects || []).map(s => s.name).filter(Boolean);
    return Array.from(new Set(names));
  }, [userSubjects]);

  // Apply filters to attendance records (same rules as History page)
  const filteredAttendance = useMemo(() => {
    let records = [...(userAttendance || [])];

    if (subjectFilter !== 'all') {
      records = records.filter(r => {
        const subjName = r.subject?.name;
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

    return records;
  }, [userAttendance, subjectFilter, filterDate]);

  // Sort by most recent date first (after filtering)
  const sortedFilteredAttendance = useMemo(() => {
    return [...filteredAttendance].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredAttendance]);

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Admin Header */}
      <header className="bg-dark-secondary text-light-primary shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshUsers}
              disabled={refreshing}
              className={`bg-dark-primary hover:bg-primary-500 px-3 py-1 rounded-md text-sm ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
              title="Refresh users"
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <button 
              onClick={handleLogout}
              className="bg-dark-primary hover:bg-primary-500 px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {error && (
          <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 text-light-primary p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* User List with Search */}
          <div className="bg-dark-secondary rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-light-primary">Users</h2>
            
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-light-primary opacity-50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input 
                  type="search" 
                  className="input w-full pl-10" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {loading && !users.length ? (
              <p className="text-light-primary opacity-70">Loading users...</p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                <ul className="space-y-2">
                  {filteredUsers.map(user => (
                    <li key={user._id || user.id}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-md ${(selectedUser?._id === user._id || selectedUser?.id === user.id) ? 'bg-primary-500 text-light-primary' : 'hover:bg-dark-primary text-light-primary'}`}
                        onClick={() => handleUserSelect(user._id || user.id)}
                      >
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-light-primary opacity-70">{user.email}</div>
                      </button>
                    </li>
                  ))}
                  {filteredUsers.length === 0 && (
                    <li className="text-light-primary opacity-70 text-center py-2">
                      {searchQuery ? 'No matching users found' : 'No users found'}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Right column: Sectioned content */}
          <div className="md:col-span-3 space-y-6">
            {selectedUser ? (
              <>
                {/* 1️⃣ User Data Section */}
                <section className="bg-dark-secondary rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-light-primary">User Data</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-light-primary/70">Name</p>
                      <p className="text-light-primary font-medium">{selectedUser.username || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-light-primary/70">Email</p>
                      <p className="text-light-primary font-medium">{selectedUser.email || '—'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-light-primary/70 mb-1">Password</p>
                      <div className="flex gap-2">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={userPassword || ''}
                          disabled
                          className="input w-full"
                          placeholder={userPassword ? undefined : 'Password not available'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="btn bg-dark-primary hover:bg-primary-500 whitespace-nowrap"
                          disabled={!userPassword}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <p className="text-[11px] text-light-primary/60 mt-1">Admin-only view. Ensure appropriate use.</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-dark-primary border border-dark-primary rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-light-primary/80">Status</p>
                        <div className="mt-1 inline-flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${selectedUser.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="font-medium">{selectedUser.active ? 'Active' : 'Inactive'}</span>
                          {selectedUser.paidTill && (
                            <span className="text-xs text-light-primary/70">Paid till: {new Date(selectedUser.paidTill).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-light-primary/70 mb-1">Activate for (days)</label>
                        <input
                          type="number"
                          min={1}
                          className="input w-full"
                          value={daysToActivate}
                          onChange={(e) => setDaysToActivate(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-2 md:ml-auto">
                        <button
                          onClick={handleActivate}
                          disabled={actionLoading}
                          className={`btn btn-primary ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          Activate
                        </button>
                        <button
                          onClick={handleDeactivate}
                          disabled={actionLoading}
                          className={`btn btn-danger ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2️⃣ User Subjects Section */}
                <section className="bg-dark-secondary rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-light-primary">User Subjects</h2>
                  {loading ? (
                    <p className="text-light-primary opacity-70">Loading user data...</p>
                  ) : subjectStatistics.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-dark-primary">
                        <thead className="bg-dark-primary">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Hours Attended
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Absent Classes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Total Hours
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Attendance %
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-dark-secondary divide-y divide-dark-primary">
                          {subjectStatistics.map(subject => (
                            <tr key={subject._id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-light-primary">
                                {subject.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-green-400">
                                {subject.attendedHours}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-red-400">
                                {subject.absent}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-light-primary">
                                {subject.totalHours}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-dark-primary rounded-full h-2.5 mr-2">
                                    <div 
                                      className={`h-2.5 rounded-full ${
                                        subject.percentage >= 75 ? 'bg-green-500' : 
                                        subject.percentage >= 60 ? 'bg-yellow-500' : 
                                        'bg-red-500'
                                      }`} 
                                      style={{ width: `${subject.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-xs font-medium ${
                                    subject.percentage >= 75 ? 'text-green-400' : 
                                    subject.percentage >= 60 ? 'text-yellow-400' : 
                                    'text-red-400'
                                  }`}>
                                    {subject.percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-light-primary opacity-70">No subjects found for this user</p>
                  )}
                </section>

                {/* 3️⃣ User Attendance Section */}
                <section className="bg-dark-secondary rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-light-primary">User Attendance</h2>
                  {/* Filters (mirroring History page) */}
                  <div className="mb-4 bg-dark-primary border border-dark-primary rounded-lg p-4 flex flex-col md:flex-row gap-3 md:items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-light-primary/70 mb-1">Subject</label>
                      <select
                        className="input w-full"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        disabled={!userSubjects.length}
                      >
                        <option value="all">All subjects</option>
                        {subjectOptions.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-light-primary/70 mb-1">Date</label>
                      <input
                        type="date"
                        className="input w-full"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                    </div>
                    <div className="md:ml-auto">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => { setSubjectFilter('all'); setFilterDate(''); }}
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>

                  {/* Hint */}
                  {sortedFilteredAttendance.length > 0 && (
                    <div className="mb-3 bg-dark-primary border border-primary-500/30 rounded-lg p-2 text-xs text-light-primary flex items-start">
                      <svg className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Most recent date records appear at the top</span>
                    </div>
                  )}

                  {sortedFilteredAttendance.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-dark-primary">
                        <thead className="bg-dark-primary">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light-primary uppercase tracking-wider">
                              Hours
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-dark-secondary divide-y divide-dark-primary">
                          {sortedFilteredAttendance.map(record => (
                            <tr key={record._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-light-primary">
                                {record.subject?.name || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-light-primary">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                                  record.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  {record.classNumber || 1} hour{record.classNumber > 1 ? 's' : ''}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-light-primary opacity-70">No attendance records found</p>
                  )}
                </section>
              </>
            ) : (
              <div className="bg-dark-secondary rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-64 text-light-primary opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-lg">Select a user to view their data</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;