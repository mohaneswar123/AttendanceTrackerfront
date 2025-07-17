import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import AdBanner from '../components/AdBanner';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, subjects, attendanceRecords, addAttendanceRecord } = useContext(AttendanceContext);
  
  // Initialize with first subject's name or empty string
  const [formData, setFormData] = useState({
    subject: subjects.length > 0 ? subjects[0]?.name || '' : '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    classNumber: 1 // Default class number
  });
  
  // Update formData if subjects change (e.g., when loaded from API)
  useEffect(() => {
    if (subjects.length > 0 && !formData.subject) {
      setFormData(prev => ({
        ...prev,
        subject: subjects[0]?.name || ''
      }));
    }
  }, [subjects]);
  
  const [existingRecord, setExistingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Check for existing record whenever subject or date changes
  useEffect(() => {
    if (formData.subject && formData.date && formData.classNumber) {
      const existing = attendanceRecords.find(record => {
        // Check for matching subject, date, and class number
        const subjectMatch = record.subject?.name === formData.subject;
        const dateMatch = record.date === formData.date;
        const classNumberMatch = Number(record.classNumber) === Number(formData.classNumber);
        
        return subjectMatch && dateMatch && classNumberMatch;
      });
      
      setExistingRecord(existing);
    } else {
      setExistingRecord(null);
    }
  }, [formData.subject, formData.date, formData.classNumber, attendanceRecords]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear any messages when form changes
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Don't submit if there's already a record with the same subject, date, and class number
    if (existingRecord) {
      setMessage({
        text: `An attendance record already exists for ${formData.subject} on ${new Date(formData.date).toLocaleDateString()} (Class ${formData.classNumber}). Please use the History page to modify it.`,
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find subject ID from name
      const subject = subjects.find(s => s.name === formData.subject);
      if (!subject) {
        throw new Error("Subject not found");
      }
      
      // Create attendance record with class number
      const newRecord = {
        ...formData,
        subjectId: subject.id,
        // Ensure classNumber is a number
        classNumber: Number(formData.classNumber)
      };
      
      addAttendanceRecord(newRecord);
      
      setMessage({
        text: `Attendance recorded successfully for ${formData.subject} (Class ${formData.classNumber})!`,
        type: 'success'
      });
      
      // Reset form but keep the current subject and date, increment class number
      setFormData(prev => ({
        ...prev,
        status: 'Present',
        classNumber: prev.classNumber < 5 ? prev.classNumber + 1 : 1 // Increment class number or cycle back to 1
      }));
    } catch (error) {
      setMessage({
        text: 'An error occurred. Please try again.',
        type: 'error'
      });
      console.error("Error submitting attendance:", error);
    }
    
    setIsSubmitting(false);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  const goToReports = () => {
    navigate('/reports');
  };

  const goToHistory = () => {
    navigate('/history');
  };

  // Get user's name to display in welcome message
  const userName = currentUser?.username || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl relative">
        {/* Enhanced Decorative Background Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full opacity-20 blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-28 h-28 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-40 left-10 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-300 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-br from-cyan-300 to-teal-300 rounded-full opacity-20 blur-xl"></div>

        {/* Welcome Section with Enhanced Gradient Background */}
        <div className="mb-8 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
          {/* Decorative patterns for welcome banner */}
          <div className="absolute top-0 right-0 w-full h-full">
            <svg className="absolute right-0 top-0 h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 Z" fill="white"></path>
            </svg>
            <div className="absolute right-10 top-5 w-20 h-20 bg-white rounded-full opacity-10"></div>
            <div className="absolute right-20 bottom-5 w-10 h-10 bg-white rounded-full opacity-10"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Welcome, <span className="font-extrabold">{userName}</span>!
            </h2>
            <p className="mt-2 text-white text-sm md:text-base font-medium">
              Track your attendance and maintain your academic records easily.
            </p>
          </div>
        </div>
        

        {/* Header Section with Darker Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Record Attendance</h1>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={goToReports}
              className="bg-gradient-to-r from-indigo-800 to-purple-900 hover:from-indigo-900 hover:to-purple-950 text-white font-medium py-2.5 px-4 rounded-lg flex items-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto justify-center border border-indigo-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </button>
          </div>
        </div>

        {/* Notification Messages with Animation */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 ease-in-out ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-500' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-500'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Main Form Card with Enhanced Glass Morphism Effect */}
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-gray-100 relative z-10">
          {/* Existing Record Alert - Now redirects to History */}
          {existingRecord && (
            <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-amber-100 px-4 py-2 border-b border-amber-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-semibold text-amber-800">Existing Record Found</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-amber-800">
                  "An attendance record already exists for <strong>{formData.subject}</strong> on <strong>{new Date(formData.date).toLocaleDateString()}</strong>. To make changes, please delete the existing entry from the History page and then submit a new record."
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-amber-800 font-medium">Current status:</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm 
                    ${existingRecord.status === 'Present' ? 'bg-green-100 text-green-800' : 
                    existingRecord.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {existingRecord.status}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <button 
                    onClick={goToHistory}
                    className="w-full bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 shadow-md border border-gray-600 hover:bg-gray-800"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Go to History
                  </button>

                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Grid with Enhanced Form Controls */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="subject">
                  Subject
                </label>
                {subjects.length > 0 ? (
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      className="appearance-none font-bold text-black block w-full bg-white bg-opacity-80 backdrop-blur-sm border border-gray-300 rounded-lg py-2.5 px-4 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 hover:border-blue-400"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{ maxWidth: '100%', textOverflow: 'ellipsis' }}
                    >
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
                    <div className="flex">
                      <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <span>No subjects available. Please add subjects in Settings.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="appearance-none font-bold text-black block w-full bg-white bg-opacity-80 backdrop-blur-sm border border-gray-300 rounded-lg py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 hover:border-blue-400"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="status">
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    className="appearance-none font-bold text-black block w-full bg-white bg-opacity-80 backdrop-blur-sm border border-gray-300 rounded-lg py-2.5 px-4 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 hover:border-blue-400"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="No Class">No Class</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="classNumber">
                  Class Hours
                </label>
                <div className="relative">
                  <select
                    id="classNumber"
                    name="classNumber"
                    className="appearance-none font-bold text-black block w-full bg-white bg-opacity-80 backdrop-blur-sm border border-gray-300 rounded-lg py-2.5 px-4 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 hover:border-blue-400"
                    value={formData.classNumber}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="5">5 Hours</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select how many hours this class was held for
                </p>
              </div>
            </div>

            {/* Submit Button with Darker Styling */}
            <div className="pt-2">
              {!existingRecord && (
                <button
                  type="submit"
                  className={`
                    ${isSubmitting ? 'bg-gray-700 cursor-not-allowed' : 
                    'bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-900 hover:to-indigo-950'} 
                    text-white font-medium py-2.5 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-blue-700
                    transition-all duration-200 w-full sm:w-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0
                    border ${isSubmitting ? 'border-gray-600' : 'border-blue-700'}
                  `}
                  disabled={subjects.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Record Attendance
                    </span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
