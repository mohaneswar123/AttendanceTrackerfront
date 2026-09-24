import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import ConfirmDialog from '../ConfirmDialog';
import { TrashIcon } from '../icons';

const STATUS_BADGE = {
  Present: 'badge-success',
  Absent: 'badge-danger',
  'No Class': 'badge-neutral'
};

// Every record so far, newest first, grouped by day
function AttendanceHistory() {
  const { currentUser, attendanceRecords, deleteAttendanceRecord, subjects } = useContext(AttendanceContext);

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');

  const subjectOptions = useMemo(
    () => Array.from(new Set((subjects || []).map(s => s.name).filter(Boolean))),
    [subjects]
  );

  const groups = useMemo(() => {
    let records = [...(attendanceRecords || [])];

    if (subjectFilter !== 'all') {
      records = records.filter(r => {
        const name = r.subject?.name || r.subject || subjects?.find?.(s => s._id === r.subjectId)?.name;
        return name === subjectFilter;
      });
    }

    if (filterDate) {
      records = records.filter(r => {
        const recorded = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
        return recorded === filterDate;
      });
    }

    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    const byDate = {};
    records.forEach(record => {
      const key = new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      (byDate[key] ||= []).push(record);
    });
    return byDate;
  }, [attendanceRecords, subjectFilter, filterDate, subjects]);

  const handleDelete = async () => {
    const record = deleting;
    setDeleting(null);
    const result = await deleteAttendanceRecord(record._id);
    if (!result.success) setNotice(result.message);
  };

  const filtered = subjectFilter !== 'all' || filterDate;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          aria-label="Filter by subject"
          className="input w-auto min-w-[10rem]"
        >
          <option value="all">All subjects</option>
          {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          aria-label="Filter by date"
          className="input w-auto [color-scheme:dark]"
        />
        {filtered && (
          <button
            type="button"
            onClick={() => { setSubjectFilter('all'); setFilterDate(''); }}
            className="btn btn-ghost"
          >
            Clear
          </button>
        )}
      </div>

      {!currentUser && (
        <div className="notice notice-warning">
          <span className="flex-1">You are not signed in, so records cannot be changed.</span>
          <Link to="/login" className="font-medium underline underline-offset-2">Sign in</Link>
        </div>
      )}

      {notice && <div className="notice notice-danger" role="alert">{notice}</div>}

      {Object.keys(groups).length === 0 ? (
        <div className="surface p-10 text-center">
          <h2 className="font-semibold text-white">No records found</h2>
          <p className="text-sm text-slate-400 mt-1">
            {filtered ? 'Nothing matches these filters.' : 'Records you save appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([date, records]) => (
            <section key={date} aria-label={date}>
              <h2 className="text-xs font-medium text-slate-500 mb-2">{date}</h2>
              <ul className="surface divide-y divide-line">
                {records.map(record => (
                  <li key={record._id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-slate-100 truncate">
                        {record.subject?.name || 'Unknown subject'}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        {record.classNumber} {Number(record.classNumber) === 1 ? 'hour' : 'hours'}
                      </span>
                    </span>
                    <span className={`badge ${STATUS_BADGE[record.status] || 'badge-neutral'}`}>{record.status}</span>
                    {currentUser && (
                      <button
                        onClick={() => setDeleting(record)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        aria-label={`Delete the ${record.subject?.name || 'record'} on ${date}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this record?"
          message={`The ${deleting.subject?.name || 'record'} on ${deleting.date} will be removed, and your percentage will change.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

export default AttendanceHistory;
