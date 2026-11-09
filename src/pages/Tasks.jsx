import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useTaskBoard, { STATUSES, STATUS_LABELS } from '../hooks/useTaskBoard';
import useMediaQuery from '../hooks/useMediaQuery';
import { dateLabel, todayLocal } from '../utils/date';
import TaskBoard from '../components/tasks/TaskBoard';
import QuickAddTask from '../components/tasks/QuickAddTask';
import TaskEditModal from '../components/tasks/TaskEditModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';
import { PlusIcon } from '../components/icons';
import FeatureShell from '../components/FeatureShell';
import StatTiles from '../components/StatTiles';

// The address decides what is shown. Today and Upcoming are date filters over the whole
// board; Board is everything at once; Done is the finished column on its own.
const VIEW_FOR_PATH = {
  '/tasks': { filter: 'today', columns: null },
  '/tasks/upcoming': { filter: 'upcoming', columns: null },
  '/tasks/board': { filter: 'today', columns: null },
  '/tasks/done': { filter: 'today', columns: ['DONE'] }
};


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
  const { pathname } = useLocation();
  const view = VIEW_FOR_PATH[pathname] || VIEW_FOR_PATH['/tasks'];
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const filterType = view.filter;
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

  // Done is the finished column on its own; everything else shows the whole board
  const columns = view.columns || (isDesktop ? STATUSES : [mobileColumn]);

  return (
    <FeatureShell onAdd={() => setAdding(true)}>
      <StatTiles label="Totals" items={[
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
          Add a task for {filterType === 'upcoming' ? 'later' : 'today'}
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

      {/* Phones show one column at a time, except on Done, which is one column already */}
      {!isDesktop && !view.columns && (
        <div className="space-y-2">
          <div className="flex p-1 rounded-xl bg-background-surface border border-line" role="tablist" aria-label="Columns">
            {STATUSES.map(status => (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={mobileColumn === status}
                onClick={() => setMobileColumn(status)}
                className={`flex-1 h-9 px-2 rounded-lg text-sm font-medium transition-colors ${mobileColumn === status
                  ? 'bg-background-paper text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'}`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 px-1">Press and hold a card to reorder it. Tap the card menu to move it.</p>
        </div>
      )}

      <TaskBoard
        columns={board.columns}
        visibleStatuses={columns}
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
    </FeatureShell>
  );
}

export default Tasks;
