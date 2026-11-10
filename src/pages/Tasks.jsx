import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useTasks from '../hooks/useTasks';
import { todayLocal } from '../utils/date';
import { doneGroups, emptyFor, importantGroups, todayGroups } from '../utils/tasks';
import FeatureShell from '../components/FeatureShell';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';
import TaskList from '../components/tasks/TaskList';
import TaskDetail from '../components/tasks/TaskDetail';
import AddTask from '../components/tasks/AddTask';

// Which view each address shows
const VIEW_FOR_PATH = {
  '/tasks': 'today',
  '/tasks/important': 'important',
  '/tasks/done': 'done'
};

function Tasks() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        title="Plan your study tasks"
        message="Log in to keep a list of what you need to do."
      />
    );
  }
  return <TasksPage />;
}

function TasksPage() {
  const { pathname } = useLocation();
  const view = VIEW_FOR_PATH[pathname] || 'today';
  const tasks = useTasks();
  const [open, setOpen] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const today = todayLocal();

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeDetail = useCallback(() => setOpen(null), []);
  const cancelDelete = useCallback(() => setDeleting(null), []);

  const groups = useMemo(() => ({
    today: todayGroups(tasks.tasks, today),
    important: importantGroups(tasks.tasks),
    done: doneGroups(tasks.tasks)
  }[view]), [tasks.tasks, view, today]);

  const overdue = useMemo(
    () => tasks.tasks.filter(task => task.status !== 'DONE' && task.taskDate < today).length,
    [tasks.tasks, today]
  );

  const withBusy = async (action) => {
    setBusy(true);
    const result = await action();
    setBusy(false);
    return result;
  };

  const handleToggle = (task) => withBusy(() => tasks.setDone(task.id, task.status !== 'DONE'));
  const handleStar = (task) => withBusy(() => tasks.saveTask(task.id, { ...task, important: !task.important }));
  const handleReorder = (activeId, overId) => withBusy(() => tasks.reorder(activeId, overId));

  const handleSave = async (fields) => {
    const result = await tasks.saveTask(open.id, { ...open, ...fields });
    if (result.success && fields.taskDate !== open.taskDate) {
      setNotice(fields.taskDate > today
        ? `Moved to ${fields.taskDate}. It appears on My Day that morning.`
        : `Moved to ${fields.taskDate === today ? 'today' : fields.taskDate}.`);
    }
    return result;
  };

  const handleAdd = async (fields) => {
    const result = await tasks.createTask(fields);
    if (result.success && fields.taskDate > today) {
      setNotice(`Added for ${fields.taskDate}. It appears on My Day that morning.`);
    }
    return result;
  };

  const handleDelete = async () => {
    const task = deleting;
    setDeleting(null);
    setOpen(null);
    const result = await tasks.deleteTask(task.id);
    setNotice(result.success ? `"${task.title}" deleted.` : result.message);
  };

  return (
    <FeatureShell onAdd={view === 'done' ? undefined : () => document.getElementById('add-task')?.focus()}>
      {notice && <div className="notice notice-info" role="status">{notice}</div>}

      {tasks.error && (
        <div className="notice notice-danger" role="alert">
          <span className="flex-1">{tasks.error}</span>
          <button onClick={tasks.clearError} className="text-rose-300 hover:text-white text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Anything left over from an earlier day is said out loud, on every view */}
      {overdue > 0 && view === 'important' && (
        <p className="text-xs text-rose-400 px-1">
          {overdue} {overdue === 1 ? 'task is' : 'tasks are'} overdue. They are waiting on My Day.
        </p>
      )}

      {view !== 'done' && <AddTask defaultDate={today} onAdd={handleAdd} />}

      {tasks.loading && tasks.tasks.length === 0
        ? <p className="text-slate-400">Loading your tasks…</p>
        : (
          <TaskList
            groups={groups}
            busy={busy}
            empty={emptyFor(view)}
            onToggle={handleToggle}
            onStar={handleStar}
            onOpen={setOpen}
            onReorder={handleReorder}
          />
        )}

      {open && (
        <TaskDetail
          task={open}
          onSave={handleSave}
          onDelete={setDeleting}
          onClose={closeDetail}
        />
      )}

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
