import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedSubject = subjects.find(s => s.name === formData.subject);
      if (!selectedSubject) throw new Error("Subject not found");

      const record = {
        ...formData,
        subjectId: selectedSubject.id,
        classNumber: Number(formData.classNumber)
      };

      addAttendanceRecord(record);

      setMessage({
        text: `✅ Attendance saved for ${formData.subject} (Class ${formData.classNumber}).`,
        type: 'success'
      });

      setFormData(prev => ({
        ...prev,
        status: 'Present',
        classNumber: prev.classNumber < 5 ? prev.classNumber + 1 : 1
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
        {/* Welcome Banner */}
        <div className="bg-blue shadow-md p-6 rounded-xl text-center text-white">
          <h2 className="text-2xl font-bold">
            Welcome, <span className="text-yellow-400">P V Mohan Eswar</span>!
          </h2>
          <p className="mt-2">
            Track your attendance effortlessly with just a few taps.
          </p>
        </div>



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

        {/* Message Feedback */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md shadow-md border-l-4 transition-all ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-500'
              : 'bg-red-50 text-red-800 border-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {/* Duplicate Warning */}
        {existingRecord && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800 shadow-sm">
            ⚠️ Attendance already exists for <strong>{formData.subject}</strong> on <strong>{formData.date}</strong> (Class <strong>{formData.classNumber}</strong>).
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
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
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
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
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="No Class">No Class</option>
                </select>
              </div>

              {/* Class Hour */}
              <div>
                <label className="block text-sm font-semibold mb-1">Class Hour</label>
                <select
                  name="classNumber"
                  value={formData.classNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>
                      {n} Hour{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full sm:w-auto px-6 py-2 rounded-lg text-white font-semibold ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-800'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Record Attendance'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
