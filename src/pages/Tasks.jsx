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
import { PlusIcon, TimerIcon } from '../components/icons';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import StatTiles from '../components/StatTiles';
import { longWeekday } from '../utils/attendance';

const FILTERS = [
  { type: 'yesterday', label: 'Yesterday' },
  { type: 'today', label: 'Today' },
  { type: 'upcoming', label: 'Upcoming' }
];


function Tasks() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
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
  // The three tabs cover the days that matter; there is no pick-a-date filter any more
  const customDate = todayLocal();
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
    onMoveTo: (task, status) => board.moveTaskToColumn(task.id, status),
    onEdit: setEditing,
    onDelete: setDeleting
  };

  return (
    <div className="space-y-4">
      <PageHeader eyebrow={longWeekday(todayLocal())} title="Tasks">
        <button onClick={() => navigate('/pomodoro')} className="btn btn-secondary rounded-full h-10 px-4">
          <TimerIcon className="w-4 h-4" />
          Focus
        </button>
      </PageHeader>

      <Tabs
        label="Show tasks for"
        items={FILTERS.map(filter => ({ value: filter.type, label: filter.label }))}
        value={filterType}
        onChange={setFilterType}
      />

      <StatTiles items={[
        { value: board.columns.TODO.length, label: 'To do', tone: 'primary' },
        { value: board.columns.IN_PROGRESS.length, label: 'In progress', tone: 'warning' },
        { value: board.columns.DONE.length, label: 'Done', tone: 'success' }
      ]} />

      {/* Adding a task is the first thing on the page, not hidden behind a button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex-1 h-12 px-4 rounded-xl surface text-left text-sm text-slate-500 flex items-center gap-3"
        >
          <span className="w-5 h-5 rounded-full border-2 border-line" aria-hidden="true" />
          Add a task for {filterType === 'yesterday' ? 'yesterday' : filterType === 'upcoming' ? 'later' : 'today'}
        </button>
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="Add task"
          className="w-12 h-12 shrink-0 rounded-xl bg-primary-600 hover:bg-primary-700 text-primary-foreground grid place-items-center transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {adding && (
        <QuickAddTask
          defaultDate={todayLocal()}
          onAdd={handleAdd}
          onClose={closeQuickAdd}
        />
      )}

      {notice && (
        <div className="notice notice-info" role="status">
          {notice}
        </div>
      )}

      {board.error && (
        <div className="notice notice-danger" role="alert">
          <span className="flex-1">{board.error}</span>
          <button onClick={board.clearError} className="text-rose-300 hover:text-white text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {/* Phones show one column at a time */}
      {!isDesktop && (
        <div className="space-y-2">
          <Tabs
            label="Columns"
            items={STATUSES.map(status => ({ value: status, label: STATUS_LABELS[status] }))}
            value={mobileColumn}
            onChange={setMobileColumn}
          />
          <p className="text-xs text-slate-500 px-1">Press and hold a card to reorder it. Tap the card menu to move it.</p>
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
