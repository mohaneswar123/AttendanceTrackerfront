import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
// ... (imports remain the same)

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, subjects, attendanceRecords, addAttendanceRecord } = useContext(AttendanceContext);

  const [formData, setFormData] = useState({
    subject: subjects[0]?.name || '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    classNumber: 1
  });

  const [existingRecord, setExistingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (subjects.length > 0 && !formData.subject) {
      setFormData(prev => ({ ...prev, subject: subjects[0].name }));
    }
  }, [subjects]);

  useEffect(() => {
    const exists = attendanceRecords.find(
      r =>
        r.subject?.name === formData.subject &&
        r.date === formData.date &&
        Number(r.classNumber) === Number(formData.classNumber)
    );
    setExistingRecord(exists || null);
  }, [formData.subject, formData.date, formData.classNumber, attendanceRecords]);

  const handleChange = e => {
    const { name, value } = e.target;
    let val = name === 'classNumber' ? Number(value) : value;

    // Restrict classNumber to only 1 or 2
    if (name === 'classNumber') {
      if (val < 1) val = 1;
      if (val > 2) val = 2;
    }

    setFormData(prev => ({ ...prev, [name]: val }));
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
      setMessage({
        text: '⚠️ Please login to record attendance.',
        type: 'error'
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedSubject = subjects.find(s => s.name === formData.subject);
      if (!selectedSubject) throw new Error("Subject not found");

      // Final check to ensure classNumber is 1 or 2
      const classNumberClamped = Math.min(Math.max(Number(formData.classNumber), 1), 2);

      const record = {
        ...formData,
        subjectId: selectedSubject.id,
        classNumber: classNumberClamped
      };

      addAttendanceRecord(record);

      setMessage({
        text: `✅ Attendance saved for ${formData.subject} (Class ${classNumberClamped}).`,
        type: 'success'
      });

      // Auto increment (but only between 1 and 2)
      const nextClass = classNumberClamped === 1 ? 2 : 1;
      setFormData(prev => ({
        ...prev,
        status: 'Present',
        classNumber: nextClass
      }));
    } catch (err) {
      console.error("Error:", err);
      setMessage({ text: '❌ Failed to record attendance. Try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const userName = currentUser?.username || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            Track Your Attendance Effortlessly – Anytime, Anywhere
          </h2>
          <p className="text-gray-700 mb-4">
            Welcome to <strong>Attendance In Hand</strong>, your personal attendance tracker designed to simplify your academic life.
          </p>
        
          <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-4">
            <li>Easily <strong>add your subjects</strong> under the <em>Settings</em> section.</li>
            <li><strong>Record your daily attendance</strong> by selecting the class date, duration, and your status.</li>
            <li>Instantly view your <strong>overall attendance percentage</strong> and track trends over time.</li>
          </ul>
        
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Why Use This App?</h3>
          <p className="text-gray-700 mb-4">
            Traditionally, tracking attendance meant maintaining physical notes or visiting the office room – often a hassle. You might miss out if staff are unavailable, or it becomes hard to stay consistent.
          </p>
          <p className="text-gray-700 mb-4">
            With <strong>Attendance In Hand</strong>, everything is streamlined. You can maintain your own private digital log, stay up to date, and take full control of your academic attendance – all in just a few taps.
          </p>
        
          <p className="font-semibold text-purple-700">Start using <strong>Attendance In Hand</strong> today and never lose track again!</p>
        </div>

        {/* Welcome Banner */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 p-6 rounded-3xl shadow-xl text-white text-center overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative z-10">
            {currentUser ? (
              <>
                <h2 className="text-3xl font-extrabold tracking-wide drop-shadow-lg animate-pulse">
                  Welcome, <span className="text-yellow-300">{userName}</span>!
                </h2>
                <p className="mt-2 text-white text-sm sm:text-base font-medium drop-shadow-sm">
                  Track your attendance effortlessly with just a few taps.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-extrabold tracking-wide drop-shadow-lg">
                  Welcome to Attendance Tracker!
                </h2>
                <p className="mt-2 text-white text-sm sm:text-base font-medium drop-shadow-sm">
                  Please <Link to="/login" className="underline font-bold hover:text-yellow-300">login</Link> to record your attendance.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Login Alert for Non-logged in Users */}
        {!currentUser && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-blue-800 font-medium">You are viewing in guest mode</p>
                <p className="text-blue-700 text-sm mt-1">
                  To record attendance and access all features, please <Link to="/login" className="underline font-semibold hover:text-blue-900">login</Link> or <Link to="/register" className="underline font-semibold hover:text-blue-900">create an account</Link>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header and Reports Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Record Attendance</h1>
          <button
            onClick={() => navigate('/reports')}
            className="mt-3 sm:mt-0 bg-indigo-700 hover:bg-indigo-800 text-white font-medium py-2 px-4 rounded-lg shadow-md w-full sm:w-auto"
          >
            View Reports
          </button>
        </div>

        {/* Feedback Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md shadow-md border-l-4 transition-all ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-500'
              : 'bg-red-50 text-red-800 border-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {existingRecord && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800 shadow-sm">
            ⚠️ Attendance already exists for <strong>{formData.subject}</strong> on <strong>{formData.date}</strong> (Class <strong>{formData.classNumber}</strong>).
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
          {!currentUser && subjects.length === 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg">
              <p className="text-yellow-800">
                <strong>No subjects available.</strong> Please login and add subjects in Settings to start tracking attendance.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold mb-1">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  disabled={!currentUser || subjects.length === 0}
                >
                  {subjects.length === 0 ? (
                    <option value="">No subjects available</option>
                  ) : (
                    subjects.map(subject => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  disabled={!currentUser}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  disabled={!currentUser}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="No Class">No Class</option>
                </select>
              </div>

              {/* Class Hour (Only 1 or 2) */}
              <div>
                <label className="block text-sm font-semibold mb-1">Class Hour</label>
                <select
                  name="classNumber"
                  value={formData.classNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  disabled={!currentUser}
                >
                  {[1, 2].map(n => (
                    <option key={n} value={n}>
                      {n} Hour{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !currentUser || subjects.length === 0}
              className={`mt-4 w-full sm:w-auto px-6 py-2 rounded-lg text-white font-semibold ${
                isSubmitting || !currentUser || subjects.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-800'
              }`}
            >
              {!currentUser ? 'Login Required' : isSubmitting ? 'Saving...' : 'Record Attendance'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
