import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useTasks from '../hooks/useTasks';
import { todayLocal } from '../utils/date';
import { longWeekday } from '../utils/attendance';
import { doneGroups, emptyFor, importantGroups, todayGroups, todayProgress } from '../utils/tasks';
import FeatureShell from '../components/FeatureShell';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';
import TaskList from '../components/tasks/TaskList';
import TaskDetail from '../components/tasks/TaskDetail';
import AddTask from '../components/tasks/AddTask';
import { ChevronRightIcon, ClockIcon } from '../components/icons';

// Which view each address shows
const VIEW_FOR_PATH = {
  '/tasks': 'today',
  '/tasks/important': 'important',
  '/tasks/done': 'done'
};

const ADD_LABEL = {
  today: 'Add a task for today',
  important: 'Add an important task',
  done: ''
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
  const [clearing, setClearing] = useState(null);
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
  const cancelClear = useCallback(() => setClearing(null), []);

  const groups = useMemo(() => ({
    today: todayGroups(tasks.tasks, today),
    important: importantGroups(tasks.tasks),
    done: doneGroups(tasks.tasks, today)
  }[view]), [tasks.tasks, view, today]);

  const progress = useMemo(() => todayProgress(tasks.tasks, today), [tasks.tasks, today]);
  const starred = useMemo(
    () => tasks.tasks.filter(task => task.important && task.status !== 'DONE').length,
    [tasks.tasks]
  );
  const finished = useMemo(() => tasks.tasks.filter(task => task.status === 'DONE').length, [tasks.tasks]);
  const overdue = useMemo(
    () => tasks.tasks.filter(task => task.status !== 'DONE' && task.taskDate < today).length,
    [tasks.tasks, today]
  );

  const subtitle = {
    today: `${longWeekday(today)} · ${progress.done} of ${progress.total} done`,
    important: `${starred} starred ${starred === 1 ? 'task' : 'tasks'}`,
    done: `${finished} ${finished === 1 ? 'task' : 'tasks'} done`
  }[view];

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

  /** Everything overdue becomes today's problem, in one go */
  const moveOverdueToToday = async (group) => {
    await withBusy(async () => {
      for (const task of group.tasks) {
        await tasks.saveTask(task.id, { ...task, taskDate: today });
      }
    });
    setNotice(`${group.tasks.length} ${group.tasks.length === 1 ? 'task' : 'tasks'} moved to today.`);
  };

  const handleGroupAction = (group) => {
    if (group.action === 'moveToToday') return moveOverdueToToday(group);
    return setClearing(group);
  };

  const confirmClear = async () => {
    const group = clearing;
    setClearing(null);
    await withBusy(async () => {
      for (const task of group.tasks) {
        await tasks.deleteTask(task.id);
      }
    });
    setNotice(`${group.tasks.length} finished ${group.tasks.length === 1 ? 'task' : 'tasks'} deleted.`);
  };

  return (
    <FeatureShell
      subtitle={subtitle}
      onAdd={view === 'done' ? undefined : () => document.getElementById('add-task')?.focus()}
    >
      {/* How much of today is behind you, where the eye already is */}
      {view === 'today' && progress.total > 0 && (
        <div className="h-1.5 rounded-full bg-background-surface overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full bg-tasks transition-all"
            style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
          />
        </div>
      )}

      {notice && <div className="notice notice-info" role="status">{notice}</div>}

      {tasks.error && (
        <div className="notice notice-danger" role="alert">
          <span className="flex-1">{tasks.error}</span>
          <button onClick={tasks.clearError} className="text-rose-300 hover:text-white text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {view !== 'done' && (
        <AddTask
          defaultDate={today}
          label={ADD_LABEL[view]}
          important={view === 'important'}
          onAdd={handleAdd}
        />
      )}

      {/* Overdue work is said out loud where it cannot be seen, and links to where it can */}
      {overdue > 0 && view === 'important' && (
        <Link
          to="/tasks"
          className="flex items-center gap-3 rounded-xl bg-rose-500/10 p-3.5 hover:bg-rose-500/15 transition-colors"
        >
          <span className="w-10 h-10 shrink-0 rounded-full bg-background-paper grid place-items-center text-rose-400">
            <ClockIcon className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-bold text-white">
              {overdue} {overdue === 1 ? 'task is' : 'tasks are'} overdue
            </span>
            <span className="block text-xs text-slate-400">Catch up on them in My Day</span>
          </span>
          <ChevronRightIcon className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
        </Link>
      )}

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
            onGroupAction={handleGroupAction}
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

      {clearing && (
        <ConfirmDialog
          title={`Delete ${clearing.tasks.length} finished ${clearing.tasks.length === 1 ? 'task' : 'tasks'}?`}
          message={`Everything you ticked off under ${clearing.title} will be removed permanently. This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={confirmClear}
          onCancel={cancelClear}
        />
      )}
    </FeatureShell>
  );
}

export default Tasks;
