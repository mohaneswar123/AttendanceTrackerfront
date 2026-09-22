import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useTaskBoard, { STATUSES, STATUS_LABELS } from '../hooks/useTaskBoard';
import useMediaQuery from '../hooks/useMediaQuery';
import { dateLabel, todayLocal } from '../utils/date';
import TaskBoard from '../components/tasks/TaskBoard';
import QuickAddTask from '../components/tasks/QuickAddTask';
import TaskEditModal from '../components/tasks/TaskEditModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';

const FILTERS = [
  { type: 'today', label: 'Today' },
  { type: 'yesterday', label: 'Yesterday' },
  { type: 'upcoming', label: 'Upcoming' },
  { type: 'all', label: 'All Tasks' }
];

const chipClass = (active) =>
  `px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${active
    ? 'bg-primary-500/20 text-primary-200 border-primary-500/40'
    : 'bg-slate-900/50 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/5'}`;

function Tasks() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        icon="📋"
        title="Plan your study tasks"
        message="Log in to add tasks and move them from To Do to Done."
      />
    );
  }
  return <TaskBoardPage />;
}

function TaskBoardPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [filterType, setFilterType] = useState('today');
  const [customDate, setCustomDate] = useState(todayLocal);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [mobileColumn, setMobileColumn] = useState('TODO');
  const [notice, setNotice] = useState('');

  const board = useTaskBoard(filterType, customDate, true);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeQuickAdd = useCallback(() => setAdding(false), []);
  const closeEdit = useCallback(() => setEditing(null), []);
  const cancelDelete = useCallback(() => setDeleting(null), []);

  const handleAdd = async (fields) => {
    const result = await board.createTask(fields);
    if (result.success && !result.visible) {
      setNotice(`Added for ${dateLabel(result.task.taskDate)}. It isn't shown under this filter.`);
    }
    return result;
  };

  const handleSaveEdit = async (fields) => {
    const result = await board.updateTask(editing.id, fields);
    if (result.success) {
      setEditing(null);
      if (!result.visible) setNotice(`Moved to ${dateLabel(result.task.taskDate)}. It isn't shown under this filter.`);
    }
    return result;
  };

  const handleDelete = async () => {
    const task = deleting;
    setDeleting(null);
    const result = await board.deleteTask(task.id);
    if (!result.success) setNotice(result.message);
  };

  const cardActions = {
    onMarkDone: (task) => board.moveTaskToColumn(task.id, 'DONE'),
    onMoveTo: (task, status) => board.moveTaskToColumn(task.id, status),
    onEdit: setEditing,
    onDelete: setDeleting
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">My Tasks</h1>
          <p className="text-slate-400">Plan your day and move tasks along as you go.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/pomodoro')} className="btn btn-outline flex-1 md:flex-none px-3 md:px-6 whitespace-nowrap">
            ⏱️ Start Pomodoro
          </button>
          <button onClick={() => setAdding(true)} className="btn btn-primary flex-1 md:flex-none px-3 md:px-6 whitespace-nowrap">
            + Add Task
          </button>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Show tasks for">
        {FILTERS.map(filter => (
          <button
            key={filter.type}
            onClick={() => setFilterType(filter.type)}
            aria-pressed={filterType === filter.type}
            className={chipClass(filterType === filter.type)}
          >
            {filter.label}
          </button>
        ))}
        <label className={`${chipClass(filterType === 'custom')} flex items-center gap-2 py-1.5`}>
          <span>Date</span>
          <input
            type="date"
            value={customDate}
            aria-label="Show tasks for a date"
            onFocus={() => setFilterType('custom')}
            onChange={(e) => {
              if (!e.target.value) return;
              setCustomDate(e.target.value);
              setFilterType('custom');
            }}
            className="bg-transparent text-sm outline-none [color-scheme:dark]"
          />
        </label>
      </div>

      {adding && (
        <QuickAddTask
          defaultDate={filterType === 'custom' ? customDate : todayLocal()}
          onAdd={handleAdd}
          onClose={closeQuickAdd}
        />
      )}

      {notice && (
        <div className="p-3 rounded-xl bg-secondary-500/10 border border-secondary-500/30 text-secondary-200 text-sm animate-fade-in" role="status">
          {notice}
        </div>
      )}

      {board.error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3" role="alert">
          <span className="flex-1">{board.error}</span>
          <button onClick={board.clearError} className="text-rose-300 hover:text-white text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {/* Phones show one column at a time */}
      {!isDesktop && (
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-900/60 border border-white/10" role="tablist" aria-label="Columns">
          {STATUSES.map(status => (
            <button
              key={status}
              role="tab"
              aria-selected={mobileColumn === status}
              onClick={() => setMobileColumn(status)}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${mobileColumn === status ? 'bg-primary-500/25 text-white' : 'text-slate-400'}`}
            >
              {STATUS_LABELS[status]} · {board.columns[status].length}
            </button>
          ))}
        </div>
      )}

      <TaskBoard
        columns={board.columns}
        visibleStatuses={isDesktop ? STATUSES : [mobileColumn]}
        loading={board.loading}
        onMove={(task, status, index) => board.moveTask(task.id, status, index)}
        cardActions={cardActions}
      />

      {editing && <TaskEditModal task={editing} onSave={handleSaveEdit} onClose={closeEdit} />}

      {deleting && (
        <ConfirmDialog
          title="Delete this task?"
          message={`"${deleting.title}" will be removed permanently.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default Tasks;
