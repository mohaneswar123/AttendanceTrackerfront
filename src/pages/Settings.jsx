import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';



function Settings() {
  const { currentUser, subjects, addSubject, removeSubject, resetAllData, updateEmail, changePassword } = useContext(AttendanceContext);
  const [newSubject, setNewSubject] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleAddSubject = () => {
    if (!currentUser) {
      setMessage({ 
        text: 'Please login to add subjects!', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }
    
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
    if (!currentUser) {
      setMessage({ 
        text: 'Please login to delete subjects!', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }
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
    if (!currentUser) {
      setMessage({ 
        text: 'Please login to reset data!', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }
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

  // Account update states
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ text: '', type: '' });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPasswordField, setConfirmPasswordField] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
  // Password visibility toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailUpdate = async () => {
    if (!currentUser) {
      setEmailMessage({ text: 'Please login to update email.', type: 'error' });
      setTimeout(() => setEmailMessage({ text: '', type: '' }), 3000);
      return;
    }
    if (!newEmail || !newEmail.includes('@')) {
      setEmailMessage({ text: 'Please enter a valid email address.', type: 'error' });
      setTimeout(() => setEmailMessage({ text: '', type: '' }), 3000);
      return;
    }
    setEmailLoading(true);
    try {
      const res = await updateEmail(currentUser._id, newEmail.trim());
      if (res.success) {
        setEmailMessage({ text: 'Email updated successfully.', type: 'success' });
        setNewEmail('');
      } else {
        setEmailMessage({ text: res.message || 'Failed to update email.', type: 'error' });
      }
    } catch (err) {
      setEmailMessage({ text: 'Failed to update email. Try again.', type: 'error' });
    } finally {
      setEmailLoading(false);
      setTimeout(() => setEmailMessage({ text: '', type: '' }), 3500);
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser) {
      setPasswordMessage({ text: 'Please login to change password.', type: 'error' });
      setTimeout(() => setPasswordMessage({ text: '', type: '' }), 3000);
      return;
    }
    if (!oldPassword || !newPassword) {
      setPasswordMessage({ text: 'Please fill all password fields.', type: 'error' });
      setTimeout(() => setPasswordMessage({ text: '', type: '' }), 3000);
      return;
    }
    if (newPassword !== confirmPasswordField) {
      setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
      setTimeout(() => setPasswordMessage({ text: '', type: '' }), 3000);
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await changePassword(currentUser.email, oldPassword, newPassword);
      if (res.success) {
        setPasswordMessage({ text: res.message || 'Password updated successfully.', type: 'success' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPasswordField('');
      } else {
        setPasswordMessage({ text: res.message || 'Failed to change password.', type: 'error' });
      }
    } catch (err) {
      setPasswordMessage({ text: 'Failed to change password. Try again.', type: 'error' });
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setPasswordMessage({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="bg-dark-primary min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-3xl relative">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full opacity-10 blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-28 h-28 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full opacity-10 blur-xl"></div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-light-primary relative z-10">Settings</h1>
        
        {/* Login Notice for Guest Users */}
        {!currentUser && (
          <div className="mb-6 bg-dark-secondary border-l-4 border-primary-500 p-4 rounded-r-lg shadow-md">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-light-primary font-medium">You are viewing in guest mode</p>
                <p className="text-light-primary/80 text-sm mt-1">
                  Please <Link to="/login" className="underline font-semibold hover:text-primary-500">login</Link> to manage subjects and settings.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 ease-in-out ${
            message.type === 'success' 
              ? 'bg-dark-secondary text-green-400 border-green-500' 
              : 'bg-dark-secondary text-red-400 border-red-500'
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
        <div className="bg-dark-secondary bg-opacity-80 backdrop-blur-md rounded-xl shadow-xl p-5 md:p-6 mb-6 border border-dark-primary relative z-10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-light-primary">Manage Subjects</h2>
          
          <div className="flex flex-col sm:flex-row mb-4 gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add new subject"
              className="flex-grow border border-dark-primary rounded-lg sm:rounded-r-none px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-primary text-light-primary bg-opacity-90"
              disabled={!currentUser}
            />
            <button 
              onClick={handleAddSubject} 
              disabled={!currentUser}
              className={`px-4 py-2.5 rounded-lg sm:rounded-l-none font-medium transition-all duration-200 shadow-md border whitespace-nowrap ${
                currentUser 
                  ? 'bg-primary-500 hover:bg-primary-600 text-dark-primary hover:shadow-lg border-primary-500 transform hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-dark-primary text-light-primary/50 cursor-not-allowed border-dark-primary'
              }`}
            >
              Add Subject
            </button>
          </div>
          
          {subjects.length === 0 ? (
            <div className="bg-dark-primary border-l-4 border-yellow-500 text-yellow-400 p-4 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>No subjects added yet. Add your first subject above.</span>
              </div>
            </div>
          ) : (
            <div className="bg-dark-primary bg-opacity-80 rounded-lg border border-dark-primary overflow-hidden">
              <ul className="divide-y divide-dark-secondary">
                {subjects.map((subject) => (
                  <li key={subject._id} className="px-4 py-3 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
                    <span className="font-medium text-light-primary break-all">{subject.name}</span>
                    {confirmDelete === subject._id ? (
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 ml-auto">
                        <span className="text-sm text-red-400 whitespace-nowrap">Delete?</span>
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
                        onClick={() => initiateDelete(subject._id)}
                        disabled={!currentUser}
                        className={`ml-3 p-1 rounded-full transition-colors ${
                          currentUser 
                            ? 'text-red-400 hover:text-red-500 hover:bg-red-500/10'
                            : 'text-light-primary/30 cursor-not-allowed'
                        }`}
                        aria-label={`Delete ${subject.name}`}
                        title={!currentUser ? 'Login required to delete' : `Delete ${subject.name}`}
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
        
        

        {/* Account: Update Email & Password */}
        <div className="bg-dark-secondary bg-opacity-80 backdrop-blur-md rounded-xl shadow-xl p-5 md:p-6 border border-dark-primary relative z-10 mt-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-light-primary">Account</h2>

          {/* Update Email */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-light-primary/90 mb-2">Update Email</h3>
            <div className="flex gap-2 flex-col md:flex-row">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={currentUser?.email || 'New email address'}
                className="flex-grow min-w-0 w-full border border-dark-primary rounded-lg px-4 py-2.5 bg-dark-primary text-light-primary"
                disabled={!currentUser || emailLoading}
              />
              <button
                onClick={handleEmailUpdate}
                disabled={!currentUser || emailLoading}
                className={`h-10 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${currentUser ? 'bg-primary-500 hover:bg-primary-600 text-dark-primary' : 'bg-dark-primary text-light-primary/50 cursor-not-allowed'}`}
              >
                {emailLoading ? 'Updating…' : 'Update Email'}
              </button>
            </div>
            {emailMessage.text && (
              <div className={`mt-3 text-sm ${emailMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{emailMessage.text}</div>
            )}
          </div>

          {/* Change Password */}
          <div>
            <h3 className="text-sm font-medium text-light-primary/90 mb-2">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="col-span-1 min-w-0 flex items-center gap-3">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Current password"
                  className="flex-1 min-w-0 w-full border border-dark-primary rounded-lg px-4 py-2.5 bg-dark-primary text-light-primary"
                  disabled={!currentUser || passwordLoading}
                  aria-label="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(s => !s)}
                  className="h-10 min-w-[56px] flex items-center justify-center text-sm px-2 rounded bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 border border-primary-500/10"
                  aria-pressed={showOldPassword}
                  aria-label={showOldPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showOldPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="col-span-1 min-w-0 flex items-center gap-3">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="flex-1 min-w-0 w-full border border-dark-primary rounded-lg px-4 py-2.5 bg-dark-primary text-light-primary"
                  disabled={!currentUser || passwordLoading}
                  aria-label="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(s => !s)}
                  className="h-10 min-w-[56px] flex items-center justify-center text-sm px-2 rounded bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 border border-primary-500/10"
                  aria-pressed={showNewPassword}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="col-span-1 min-w-0 flex items-center gap-3">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPasswordField}
                  onChange={(e) => setConfirmPasswordField(e.target.value)}
                  placeholder="Confirm new password"
                  className="flex-1 min-w-0 w-full border border-dark-primary rounded-lg px-4 py-2.5 bg-dark-primary text-light-primary"
                  disabled={!currentUser || passwordLoading}
                  aria-label="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(s => !s)}
                  className="h-10 min-w-[56px] flex items-center justify-center text-sm px-2 rounded bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 border border-primary-500/10"
                  aria-pressed={showConfirmPassword}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={handleChangePassword}
                disabled={!currentUser || passwordLoading}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md ${currentUser ? 'bg-primary-500 hover:bg-primary-600 text-dark-primary' : 'bg-dark-primary text-light-primary/50 cursor-not-allowed'}`}
              >
                {passwordLoading ? 'Saving…' : 'Change Password'}
              </button>
            </div>
            {passwordMessage.text && (
              <div className={`mt-3 text-sm ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{passwordMessage.text}</div>
            )}
          </div>
        </div>

        {/* Reset Attendance Section */}
        <div className="bg-dark-secondary bg-opacity-80 backdrop-blur-md rounded-xl shadow-xl p-5 md:p-6 border border-dark-primary relative z-10 mt-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-light-primary">Reset Data</h2>
          <p className="text-light-primary/80 mb-4">
            Warning: This will delete all attendance records. This action cannot be undone.
          </p>
          
          {isResetting ? (
            <div className="bg-dark-primary border-l-4 border-red-500 p-4 mb-4 rounded-r-md">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-shrink-0 mb-2 sm:mb-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-0 sm:ml-3">
                  <h3 className="text-sm font-medium text-red-400">
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
              disabled={!currentUser}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md border transform flex items-center ${
                currentUser
                  ? 'bg-red-600 hover:bg-red-700 text-light-primary hover:shadow-lg border-red-600 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-dark-primary text-light-primary/50 cursor-not-allowed border-dark-primary'
              }`}
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
