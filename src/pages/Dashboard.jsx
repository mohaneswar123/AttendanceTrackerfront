import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import WelcomeBanner from '../components/WelcomeBanner';
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
        (r.subject?.name || r.subject) === formData.subject &&
        r.date === formData.date &&
        Number(r.classNumber) === Number(formData.classNumber)
    );
    setExistingRecord(exists || null);
  }, [formData.subject, formData.date, formData.classNumber, attendanceRecords]);

  const handleChange = e => {
    const { name, value } = e.target;
    let val = name === 'classNumber' ? Number(value) : value;

    // Restrict classNumber to 1, 2, or 3
    if (name === 'classNumber') {
      if (val < 1) val = 1;
      if (val > 3) val = 3;
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

      // Final check to ensure classNumber is 1, 2, or 3
      const classNumberClamped = Math.min(Math.max(Number(formData.classNumber), 1), 3);

      const record = {
        ...formData,
        subjectId: selectedSubject._id,
        classNumber: classNumberClamped
      };

      addAttendanceRecord(record);

      setMessage({
        text: `✅ Attendance saved for ${formData.subject} (Class ${classNumberClamped}).`,
        type: 'success'
      });

      // Auto increment through 1 -> 2 -> 3 -> 1
      const nextClass = classNumberClamped === 1 ? 2 : classNumberClamped === 2 ? 3 : 1;
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
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        

        <WelcomeBanner currentUser={currentUser} />

        {/* Subscription Paid Till Info */}
        {currentUser?.paidTill && (
          <div className="mb-6 bg-dark-secondary border border-primary-500/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-light-primary/50">Subscription</p>
              <p className="text-light-primary mt-1 font-medium">Paid upto: {new Date(currentUser.paidTill).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Login Alert for Non-logged in Users */}
        {!currentUser && (
          <div className="bg-dark-secondary border-l-4 border-primary-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-light-primary font-medium">You are viewing in guest mode</p>
                <p className="text-light-primary/80 text-sm mt-1">
                  To record attendance and access all features, please <Link to="/login" className="underline font-semibold hover:text-primary-500">login</Link> or <Link to="/register" className="underline font-semibold hover:text-primary-500">create an account</Link>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header and Reports Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-light-primary">Record Attendance</h1>
          <button
            onClick={() => navigate('/reports')}
            className="mt-3 sm:mt-0 bg-primary-500 hover:bg-primary-600 text-dark-primary font-medium py-2 px-4 rounded-lg shadow-md w-full sm:w-auto"
          >
            View Reports
          </button>
        </div>

        {/* Feedback Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md shadow-md border-l-4 transition-all ${
            message.type === 'success'
              ? 'bg-dark-secondary text-green-400 border-green-500'
              : 'bg-dark-secondary text-red-400 border-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {existingRecord && (
          <div className="mb-6 bg-dark-secondary border border-yellow-500 rounded-lg p-4 text-yellow-400 shadow-sm">
            ⚠️ Attendance already exists for <strong>{formData.subject}</strong> on <strong>{formData.date}</strong> (Class <strong>{formData.classNumber}</strong>) if you need, you can still submit.
          </div>
        )}

        {/* Form */}
        <div className="bg-dark-secondary p-6 sm:p-8 rounded-xl shadow-xl">
          {!currentUser && subjects.length === 0 && (
            <div className="bg-dark-primary border-l-4 border-yellow-500 p-4 mb-4 rounded-r-lg">
              <p className="text-yellow-400">
                <strong>No subjects available.</strong> Please login and add subjects in Settings to start tracking attendance.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-light-primary">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-2 border border-dark-primary bg-dark-primary text-light-primary rounded focus:ring-2 focus:ring-primary-500"
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
                <label className="block text-sm font-semibold mb-1 text-light-primary">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 border border-dark-primary bg-dark-primary text-light-primary rounded focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={!currentUser}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-light-primary">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-dark-primary bg-dark-primary text-light-primary rounded focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={!currentUser}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="No Class">No Class</option>
                </select>
              </div>

              {/* Class Hours (1, 2, or 3) */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-light-primary">Class Hour</label>
                <select
                  name="classNumber"
                  value={formData.classNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-dark-primary bg-dark-primary text-light-primary rounded focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={!currentUser}
                >
                  {[1, 2, 3].map(n => (
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
              className={`mt-4 w-full sm:w-auto px-6 py-2 rounded-lg font-semibold ${
                isSubmitting || !currentUser || subjects.length === 0 ? 'bg-dark-primary text-light-primary/50 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600 text-dark-primary'
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
