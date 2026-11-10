// How tasks are grouped and described. The server decides what is stored; this decides
// what the student is shown and in what order.
import { todayLocal } from './date';

export const isDone = (task) => task.status === 'DONE';
export const isOverdue = (task, today = todayLocal()) => !isDone(task) && task.taskDate < today;

/** "2 of 5" once a task has steps, otherwise nothing */
export const stepsLabel = (task) => {
  const steps = task.steps || [];
  if (steps.length === 0) return '';
  return `${steps.filter(step => step.done).length} of ${steps.length}`;
};

/**
 * How a task's day reads on its row. Overdue days are named rather than counted, because
 * "Mon 9 Nov" tells a student more about what they missed than "2 days ago".
 */
export const dayLabel = (iso, today = todayLocal()) => {
  if (iso === today) return 'Today';
  const date = new Date(`${iso}T00:00:00`);
  const diff = Math.round((date - new Date(`${today}T00:00:00`)) / 86400000);
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  const sameYear = date.getFullYear() === new Date(`${today}T00:00:00`).getFullYear();
  return date.toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' })
  });
};

/**
 * The Today screen, as two groups.
 *
 * Overdue comes first and is never hidden. A task that was not finished on the day it was
 * planned for does not quietly fall off the screen the next morning: it stays in front of
 * the student, still showing the day it was for, until it is done or moved.
 */
export const todayGroups = (tasks, today = todayLocal()) => {
  const open = tasks.filter(task => !isDone(task));
  return [
    { id: 'overdue', title: 'Overdue', tone: 'overdue', tasks: open.filter(task => task.taskDate < today) },
    { id: 'today', title: 'Today', tone: 'plain', tasks: open.filter(task => task.taskDate === today) }
  ].filter(group => group.tasks.length > 0);
};

/** Everything still to come, a day at a time */
export const upcomingGroups = (tasks, today = todayLocal()) => {
  const open = tasks.filter(task => !isDone(task) && task.taskDate > today);
  const byDay = new Map();
  open.forEach(task => {
    if (!byDay.has(task.taskDate)) byDay.set(task.taskDate, []);
    byDay.get(task.taskDate).push(task);
  });
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, group]) => ({ id: date, title: dayLabel(date, today), tone: 'plain', tasks: group }));
};

/** Starred and not yet done, oldest day first */
export const importantGroups = (tasks) => {
  const starred = tasks.filter(task => task.important && !isDone(task));
  if (starred.length === 0) return [];
  return [{
    id: 'important',
    title: 'Important',
    tone: 'plain',
    tasks: [...starred].sort((a, b) => a.taskDate.localeCompare(b.taskDate))
  }];
};

/** Finished tasks, most recently finished first */
export const doneGroups = (tasks) => {
  const done = tasks.filter(isDone);
  if (done.length === 0) return [];
  return [{
    id: 'done',
    title: 'Completed',
    tone: 'plain',
    tasks: [...done].sort((a, b) => String(b.completedAt || '').localeCompare(String(a.completedAt || '')))
  }];
};

/** What the Today screen says when there is nothing left */
export const emptyFor = (view) => ({
  today: { title: 'Nothing left for today', body: 'Add a task below, or enjoy the gap.' },
  upcoming: { title: 'Nothing planned ahead', body: 'Tasks you give a future date appear here.' },
  important: { title: 'Nothing starred', body: 'Star a task and it will wait for you here.' },
  done: { title: 'Nothing finished yet', body: 'Tasks you tick off collect here.' }
}[view] || { title: 'Nothing here', body: '' });
