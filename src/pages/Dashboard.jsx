import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, subjects, attendanceRecords, addAttendanceRecord } = useContext(AttendanceContext);

  const [formData, setFormData] = useState({
    subject: subjects.length > 0 ? subjects[0]?.name || '' : '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    classNumber: 1
  });

  const [existingRecord, setExistingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (subjects.length > 0 && !formData.subject) {
      setFormData(prev => ({
        ...prev,
        subject: subjects[0]?.name || ''
      }));
    }
  }, [subjects]);

  useEffect(() => {
    if (formData.subject && formData.date && formData.classNumber) {
      const existing = attendanceRecords.find(record => {
        return (
          record.subject?.name === formData.subject &&
          record.date === formData.date &&
          Number(record.classNumber) === Number(formData.classNumber)
        );
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
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const subject = subjects.find(s => s.name === formData.subject);
      if (!subject) throw new Error("Subject not found");

      const newRecord = {
        ...formData,
        subjectId: subject.id,
        classNumber: Number(formData.classNumber)
      };

      addAttendanceRecord(newRecord);

      setMessage({
        text: `Attendance recorded successfully for ${formData.subject} (Class ${formData.classNumber})!`,
        type: 'success'
      });

      setFormData(prev => ({
        ...prev,
        status: 'Present',
        classNumber: prev.classNumber < 5 ? prev.classNumber + 1 : 1
      }));
    } catch (error) {
      setMessage({
        text: 'An error occurred. Please try again.',
        type: 'error'
      });
      console.error("Error submitting attendance:", error);
    }

    setIsSubmitting(false);

    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  const goToReports = () => navigate('/reports');
  const goToHistory = () => navigate('/history');

  const userName = currentUser?.username || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl relative">

        <div className="mb-8 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Welcome, <span className="font-extrabold">{userName}</span>!
            </h2>
            <p className="mt-2 text-white text-sm md:text-base font-medium">
              Track your attendance and maintain your academic records easily.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Record Attendance</h1>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={goToReports}
              className="bg-gradient-to-r from-indigo-800 to-purple-900 hover:from-indigo-900 hover:to-purple-950 text-white font-medium py-2.5 px-4 rounded-lg flex items-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto justify-center border border-indigo-700"
            >
              Reports
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 ease-in-out ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-500' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {existingRecord && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800 shadow-sm">
            ⚠️ A similar attendance record already exists for <strong>{formData.subject}</strong> on <strong>{new Date(formData.date).toLocaleDateString()}</strong> (Class <strong>{formData.classNumber}</strong>). You can still submit another record.
          </div>
        )}

        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-gray-100 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Subject</label>
                <select
                  name="subject"
                  className="w-full p-2 rounded border"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  className="w-full p-2 rounded border"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Status</label>
                <select
                  name="status"
                  className="w-full p-2 rounded border"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="No Class">No Class</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Class Hours</label>
                <select
                  name="classNumber"
                  className="w-full p-2 rounded border"
                  value={formData.classNumber}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} Hour{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`mt-4 px-6 py-2 rounded-lg text-white font-semibold 
                  ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-800'}
                `}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Record Attendance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
