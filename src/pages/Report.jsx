import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';



function Report() {
  const { currentUser, subjects, attendanceRecords } = useContext(AttendanceContext);

  // Derive subjects from attendance records if subjects list is empty or missing
  const derivedSubjects = useMemo(() => {
    if (subjects && subjects.length > 0) return subjects;
    const unique = new Map();
    attendanceRecords.forEach(record => {
      const subjObj = record.subject; // may be object or string
      if (typeof subjObj === 'object' && subjObj !== null) {
        if (!unique.has(subjObj.name)) {
          unique.set(subjObj.name, { _id: subjObj._id || subjObj.id || subjObj.name, name: subjObj.name });
        }
      } else if (typeof subjObj === 'string' && subjObj.trim() !== '') {
        if (!unique.has(subjObj)) {
          unique.set(subjObj, { _id: subjObj, name: subjObj });
        }
      }
    });
    return Array.from(unique.values());
  }, [subjects, attendanceRecords]);

  // Calculate attendance statistics for each subject
  const statistics = useMemo(() => {
    const stats = {};
    // Initialize from either actual subjects or derived subjects
    derivedSubjects.forEach(subject => {
      stats[subject.name] = {
        present: 0,
        absent: 0,
        noClass: 0,
        totalHours: 0,
        totalAttendedHours: 0,
        missedHours: 0,
        percentage: 0
      };
    });

    attendanceRecords.forEach(record => {
      // Determine subject name via linked subject object or subjectId mapping
      const subjectName = record.subject?.name || record.subject || (subjects.find(s => s._id === record.subjectId)?.name);
      if (!subjectName) return;
      const hours = Number(record.classNumber) || 1;
      if (!stats[subjectName]) {
        // Handle case where a record exists for a subject not initialized yet
        stats[subjectName] = {
          present: 0,
          absent: 0,
          noClass: 0,
          totalHours: 0,
          totalAttendedHours: 0,
          missedHours: 0,
          percentage: 0
        };
      }
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

    Object.keys(stats).forEach(subjectName => {
      const { totalAttendedHours, totalHours } = stats[subjectName];
      stats[subjectName].percentage = totalHours > 0 ? Math.round((totalAttendedHours / totalHours) * 100) : 0;
    });
    return stats;
  }, [derivedSubjects, attendanceRecords]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    let totalAttendedHours = 0;
    let totalHours = 0;
    let totalMissedHours = 0; // NEW: Track total missed hours
    let totalClassesAttended = 0;
    let totalClassesHeld = 0;
    
    Object.values(statistics).forEach(stat => {
      totalAttendedHours += stat.totalAttendedHours;
      totalMissedHours += stat.missedHours; // NEW: Add missed hours
      totalHours += stat.totalHours;
      totalClassesAttended += stat.present;
      totalClassesHeld += (stat.present + stat.absent);
    });
    
    const averagePercentage = totalHours > 0 
      ? Math.round((totalAttendedHours / totalHours) * 100) 
      : 0;
      
    return {
      totalAttendedHours,
      totalMissedHours,
      totalHours,
      totalClassesAttended,
      totalClassesHeld,
      averagePercentage
    };
  }, [statistics]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header with Gradient Background */}
      <div className="relative mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg overflow-hidden">
       
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Attendance Report</h1>
          <p className="text-blue-100 text-sm md:text-base">
            Your attendance summary and detailed statistics
          </p>
          {!currentUser && (
            <p className="text-yellow-200 text-xs mt-2 font-medium">
              ⚠️ You are in guest mode. <Link to="/login" className="underline hover:text-white">Login</Link> to see your personal report.
            </p>
          )}
        </div>
        <div className="absolute right-0 top-0 h-full w-64 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-full w-full" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
      </div>
      
      {derivedSubjects.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-700">No subjects or attendance records found.</p>
              <p className="text-yellow-600 text-sm mt-1">
                {currentUser ? (
                  <>Add subjects and start recording attendance in <Link to="/settings" className="underline font-semibold">Settings</Link>.</>
                ) : (
                  <>Please <Link to="/login" className="underline font-semibold">login</Link> to begin tracking attendance.</>
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards - More Attractive for Mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 transform transition hover:shadow-lg">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0014.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Subjects</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{subjects.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 transform transition hover:shadow-lg">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Hours Attended</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{overallStats.totalAttendedHours}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 transform transition hover:shadow-lg">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total Hours</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{overallStats.totalHours}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 transform transition hover:shadow-lg">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Attendance</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600">{overallStats.averagePercentage}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Circle for Mobile with Enhanced Visibility */}
          

          {/* Responsive Cards for Subject Stats (Mobile View) */}
          <div className="block md:hidden mb-8">
            <h2 className="text-xl font-semibold mb-4">Subject-wise Attendance</h2>
            <div className="space-y-3">
              {derivedSubjects.map(subject => {
                const stat = statistics[subject.name] || { present: 0, absent: 0, totalHours: 0, totalAttendedHours: 0, missedHours: 0, percentage: 0 };
                return (
                  <div key={subject._id || subject.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">{subject.name}</h3>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          stat.percentage >= 75 ? 'bg-green-100 text-green-800' :
                          stat.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {stat.percentage}%
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div 
                        className={`h-2.5 rounded-full ${
                          stat.percentage >= 75 ? 'bg-green-500' : 
                          stat.percentage >= 60 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Hours Attended</p>
                        <p className="font-semibold text-green-600">{stat.totalAttendedHours}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Hours Missed</p> {/* Changed from Missed Classes */}
                        <p className="font-semibold text-red-600">{stat.missedHours}</p> {/* Changed */}
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Total Hours</p>
                        <p className="font-semibold">{stat.totalHours}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Table (Hidden on Mobile, Visible on Tablet/Desktop) */}
          <div className="hidden md:block bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Subject</th>
                  <th className="py-3 px-4 text-center">Hours Attended</th>
                  <th className="py-3 px-4 text-center">Hours Missed</th> {/* Changed from Classes Missed */}
                  <th className="py-3 px-4 text-center">Total Hours</th>
                  <th className="py-3 px-4 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {derivedSubjects.map(subject => {
                  const stat = statistics[subject.name] || { 
                    present: 0, 
                    absent: 0, 
                    totalHours: 0, 
                    totalAttendedHours: 0,
                    missedHours: 0, 
                    percentage: 0 
                  };
                  return (
                    <tr key={subject._id || subject.name} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium">{subject.name}</td>
                      <td className="py-4 px-4 text-center text-green-600 font-medium">{stat.totalAttendedHours}</td>
                      <td className="py-4 px-4 text-center text-red-600 font-medium">{stat.missedHours}</td> {/* Changed */}
                      <td className="py-4 px-4 text-center">{stat.totalHours}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                stat.percentage >= 75 ? 'bg-green-500' : 
                                stat.percentage >= 60 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`} 
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              stat.percentage >= 75 ? 'bg-green-100 text-green-800' :
                              stat.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {stat.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Print Button with enhanced styling */}
          <div className="mt-6 flex justify-center md:justify-end">
            <button 
              onClick={() => window.print()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center shadow-md transform transition hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Report;
