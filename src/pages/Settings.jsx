import React, { useState, useContext } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';



function Settings() {
  const { subjects, addSubject, removeSubject, resetAllData } = useContext(AttendanceContext);
  const [newSubject, setNewSubject] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      // Check if subject already exists - now checking against subject names
      const subjectExists = subjects.some(subject => 
        subject.name && subject.name.toLowerCase() === newSubject.trim().toLowerCase()
      );
      
      if (subjectExists) {
        setMessage({ 
          text: 'This subject already exists!', 
          type: 'error' 
        });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        return;
      }
      
      addSubject(newSubject.trim());
      setNewSubject('');
      setMessage({
        text: 'Subject added successfully!',
        type: 'success'
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSubject();
    }
  };

  const initiateDelete = (subjectId) => {
    setConfirmDelete(subjectId);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const confirmDeleteSubject = () => {
    if (confirmDelete) {
      removeSubject(confirmDelete);
      setConfirmDelete(null);
      setMessage({
        text: 'Subject deleted successfully!',
        type: 'success'
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const initiateReset = () => {
    setIsResetting(true);
  };

  const confirmReset = () => {
    resetAllData();
    setIsResetting(false);
    setMessage({
      text: 'All attendance records have been reset.',
      type: 'success'
    });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const cancelReset = () => {
    setIsResetting(false);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl relative">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full opacity-20 blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-28 h-28 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-20 blur-xl"></div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 relative z-10">Settings</h1>
        
        {/* Success/Error Messages */}
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
        
        {/* Manage Subjects Section */}
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-xl p-5 md:p-6 mb-6 border border-gray-100 relative z-10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Manage Subjects</h2>
          
          <div className="flex flex-col sm:flex-row mb-4 gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add new subject"
              className="flex-grow border border-gray-300 rounded-lg sm:rounded-r-none px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white bg-opacity-90"
            />
            <button 
              onClick={handleAddSubject} 
              className="bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-900 hover:to-indigo-950 text-white px-4 py-2.5 rounded-lg sm:rounded-l-none font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-blue-700 transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              Add Subject
            </button>
          </div>
          
          {subjects.length === 0 ? (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>No subjects added yet. Add your first subject above.</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 bg-opacity-80 rounded-lg border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <li key={subject.id} className="px-4 py-3 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
                    <span className="font-medium text-gray-800 break-all">{subject.name}</span>
                    {confirmDelete === subject.id ? (
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 ml-auto">
                        <span className="text-sm text-red-600 whitespace-nowrap">Delete?</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={confirmDeleteSubject}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Yes
                          </button>
                          <button 
                            onClick={cancelDelete}
                            className="bg-gray-400 hover:bg-gray-500 text-white text-sm px-3 py-1.5 rounded-md flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => initiateDelete(subject.id)}
                        className="text-red-500 hover:text-red-700 ml-3 p-1 hover:bg-red-50 rounded-full transition-colors"
                        aria-label={`Delete ${subject.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Reset Attendance Section */}
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-xl p-5 md:p-6 border border-gray-100 relative z-10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Reset Data</h2>
          <p className="text-gray-600 mb-4">
            Warning: This will delete all attendance records. This action cannot be undone.
          </p>
          
          {isResetting ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-md">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-shrink-0 mb-2 sm:mb-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-0 sm:ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Are you absolutely sure?
                  </h3>
                  <div className="mt-2 flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-3">
                    <button
                      onClick={confirmReset}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md font-medium shadow-sm flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Yes, delete everything
                    </button>
                    <button
                      onClick={cancelReset}
                      className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-md font-medium shadow-sm flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={initiateReset} 
              className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-red-800 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset All Attendance Records
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
