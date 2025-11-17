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
  
  // Apply filters
  const filteredRecords = useMemo(() => {
    let records = [...(attendanceRecords || [])];

    if (subjectFilter !== 'all') {
      records = records.filter(r => {
        const subjName = r.subject?.name 
          || r.subject 
          || (subjects?.find?.(s => s._id === r.subjectId)?.name);
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
  }, [attendanceRecords, subjectFilter, filterDate, subjects]);

  // Simple date sorting - most recent records first (applied after filtering)
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredRecords]);

  // Handle delete functionality
  const handleDelete = (id) => {
    // Check if user is logged in
    if (!currentUser) {
      alert('Please login to delete attendance records.');
      return;
    }
    
    // Find the record to display in confirmation
    const recordToDelete = attendanceRecords.find(record => record._id === id);
    if (!recordToDelete) return;
    
    const subject = recordToDelete.subject?.name || recordToDelete.subject;
    const date = new Date(recordToDelete.date).toLocaleDateString();
    const classNumber = recordToDelete.classNumber || 1;
    
    if (confirm(`Delete attendance record?\n\nSubject: ${subject}\nDate: ${date}\nHours: ${classNumber}\nStatus: ${recordToDelete.status}\n\nThis action cannot be undone.`)) {
      deleteAttendanceRecord(id);
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header with gradient background */}
        <div className="relative mb-6 bg-gradient-to-r from-dark-secondary to-primary-500 rounded-xl p-5 text-light-primary shadow-lg overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold">Attendance History</h1>
            <p className="text-light-primary/80 text-sm mt-1">View and manage your attendance records</p>
            {!currentUser && (
              <p className="text-yellow-400 text-xs mt-2 font-medium">
                ⚠️ You are in guest mode. <Link to="/login" className="underline hover:text-primary-400">Login</Link> to delete records.
              </p>
            )}
          </div>
          <div className="absolute right-0 top-0 h-full w-64 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-full w-full" strokeWidth="0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-dark-secondary border border-dark-primary rounded-lg p-4 flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-xs text-light-primary/70 mb-1">Subject</label>
            <select
              className="input w-full"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
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
  
        {/* Notice at top when records exist */}
        {sortedRecords.length > 0 && (
          <div className="mb-4 bg-dark-secondary border border-primary-500/30 rounded-lg p-3 text-sm text-light-primary flex items-start">
            <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="font-medium">Most recent date records appear at the top</p>
            </div>
          </div>
        )}
        
        {sortedRecords.length === 0 ? (
          <div className="bg-dark-secondary rounded-xl shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-light-primary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {attendanceRecords.length === 0 ? (
              <>
                <p className="text-light-primary text-lg">No attendance records yet.</p>
                <p className="text-light-primary/70 text-sm mt-2">Records will appear here once you've marked attendance.</p>
              </>
            ) : (
              <>
                <p className="text-light-primary text-lg">No records match the selected filters.</p>
                <p className="text-light-primary/70 text-sm mt-2">Try changing the subject or date range.</p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Mobile view - card layout */}
            <div className="block md:hidden space-y-4">
              {sortedRecords.map(record => (
                <div key={record._id} className="bg-dark-secondary rounded-xl shadow-sm border border-dark-primary">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-light-primary">
                        {record.subject?.name || record.subject}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                        record.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center mb-4 text-sm text-light-primary/70">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-light-primary/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                          {record.classNumber || 1} hour{record.classNumber > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-3">
                      <button 
                        onClick={() => handleDelete(record._id)}
                        disabled={!currentUser}
                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                          currentUser 
                            ? 'bg-red-600 text-light-primary hover:bg-red-700' 
                            : 'bg-dark-primary text-light-primary/50 cursor-not-allowed'
                        }`}
                        title={!currentUser ? 'Login required to delete' : 'Delete record'}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop view - table layout */}
            <div className="hidden md:block">
              <div className="bg-dark-secondary rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-dark-primary">
                    <thead className="bg-gradient-to-r from-dark-secondary to-primary-500 text-light-primary">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium uppercase tracking-wider">Subject</th>
                        <th className="py-3 px-4 text-left text-sm font-medium uppercase tracking-wider">
                          Date
                          <span className="text-xs normal-case ml-2 font-normal bg-blue-500 py-0.5 px-1.5 rounded">Most recent first</span>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium uppercase tracking-wider">Hours</th>
                        <th className="py-3 px-4 text-left text-sm font-medium uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-primary">
                      {sortedRecords.map(record => (
                        <tr key={record._id} className="hover:bg-dark-primary transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-medium text-light-primary">{record.subject?.name || (subjects?.find?.(s => s._id === record.subjectId)?.name) || record.subject || '—'}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-light-primary">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {record.classNumber || 1} hour{record.classNumber > 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                              record.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleDelete(record._id)}
                                disabled={!currentUser}
                                className={`px-3 py-1 rounded text-sm flex items-center ${
                                  currentUser 
                                    ? 'bg-red-600 text-light-primary hover:bg-red-700' 
                                    : 'bg-dark-primary text-light-primary/50 cursor-not-allowed'
                                }`}
                                title={!currentUser ? 'Login required to delete' : 'Delete record'}
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default History;
