import { useState } from 'react';

function AttendanceForm() {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Present');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ subject, date, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light-primary">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="mt-1 block w-full border border-dark-secondary bg-dark-primary text-light-primary rounded-md shadow-sm focus:ring focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light-primary">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full border border-dark-secondary bg-dark-primary text-light-primary rounded-md shadow-sm focus:ring focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light-primary">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full border border-dark-secondary bg-dark-primary text-light-primary rounded-md shadow-sm focus:ring focus:ring-primary-500"
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-primary-500 text-dark-primary py-2 rounded-md hover:bg-primary-600 font-semibold"
      >
        Submit Attendance
      </button>
    </form>
  );
}

export default AttendanceForm;