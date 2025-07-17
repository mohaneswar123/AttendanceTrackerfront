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
  const navigate = useNavigate();

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllUsers();
        setUsers(response);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch user data when a user is selected
  useEffect(() => {
    if (!selectedUser) {
      setUserSubjects([]);
      setUserAttendance([]);
      return;
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch subjects for selected user
        const subjects = await adminService.getUserSubjects(selectedUser.id);
        setUserSubjects(subjects);
        
        // Fetch attendance records for selected user
        const attendance = await adminService.getUserAttendance(selectedUser.id);
        setUserAttendance(attendance);
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedUser]);

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user || null);
  };

  const handleLogout = () => {
    logout(); // Use the existing logout function
    navigate('/admin/login');
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
    
    const statistics = userSubjects.map(subject => {
      // Filter attendance records for this subject
      const subjectRecords = userAttendance.filter(record => 
        record.subject?.id === subject.id
      );
      
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
    
    return statistics;
  }, [userSubjects, userAttendance]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-purple-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-purple-800 hover:bg-purple-900 px-3 py-1 rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* User List with Search */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input 
                  type="search" 
                  className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {loading && !users.length ? (
              <p className="text-gray-500">Loading users...</p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                <ul className="space-y-2">
                  {filteredUsers.map(user => (
                    <li key={user.id}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-md ${selectedUser?.id === user.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </button>
                    </li>
                  ))}
                  {filteredUsers.length === 0 && (
                    <li className="text-gray-500 text-center py-2">
                      {searchQuery ? 'No matching users found' : 'No users found'}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-3">
            {selectedUser ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {selectedUser.username}'s Data
                </h2>
                
                {loading ? (
                  <p className="text-gray-500">Loading user data...</p>
                ) : (
                  <div className="space-y-8">
                    {/* User Subjects with Attendance Statistics */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Subjects and Attendance Statistics</h3>
                      {subjectStatistics.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Hours Attended
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Absent Classes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Hours
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Attendance %
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {subjectStatistics.map(subject => (
                                <tr key={subject.id}>
                                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    {subject.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                                    {subject.attendedHours}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                                    {subject.absent}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {subject.totalHours}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
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
                                        subject.percentage >= 75 ? 'text-green-700' : 
                                        subject.percentage >= 60 ? 'text-yellow-700' : 
                                        'text-red-700'
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
                        <p className="text-gray-500">No subjects found for this user</p>
                      )}
                    </div>

                    {/* User Attendance Records */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Attendance Records</h3>
                      {userAttendance.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Hours
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {userAttendance.map(record => (
                                <tr key={record.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {record.subject?.name || '—'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
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
                        <p className="text-gray-500">No attendance records found</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
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