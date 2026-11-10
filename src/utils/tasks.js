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
 * My Day, as two groups.
 *
 * Overdue comes first and is never hidden. A task that was not finished on the day it was
 * planned for does not quietly fall off the screen the next morning: it stays in front of
 * the student, still showing the day it was for, until it is done or moved.
 */
export const todayGroups = (tasks, today = todayLocal()) => {
  const open = tasks.filter(task => !isDone(task));
  return [
    {
      id: 'overdue',
      title: 'Overdue',
      tone: 'overdue',
      // The only group with an action on it: everything here can be dragged into today at once
      action: 'moveToToday',
      tasks: open.filter(task => task.taskDate < today)
    },
    { id: 'today', title: 'Today', tone: 'plain', tasks: open.filter(task => task.taskDate === today) },
    // Today's finished work stays in sight rather than vanishing to another screen: it is
    // what makes "1 of 6 done" believable
    {
      id: 'done',
      title: 'Done',
      tone: 'plain',
      tasks: tasks.filter(task => isDone(task) && task.taskDate === today)
    }
  ].filter(group => group.tasks.length > 0);
};

/** How much of today is behind you: finished over everything that was due */
export const todayProgress = (tasks, today = todayLocal()) => {
  const mine = tasks.filter(task => task.taskDate <= today && (isDone(task) ? task.taskDate === today : true));
  const done = mine.filter(isDone).length;
  return { done, total: mine.length };
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

/**
 * Finished tasks, newest day first.
 *
 * Grouped by the day they were for rather than one long list, so "Clear all" can mean a
 * day's worth rather than everything ever finished.
 */
export const doneGroups = (tasks, today = todayLocal()) => {
  const done = tasks.filter(isDone);
  const byDay = new Map();
  done.forEach(task => {
    if (!byDay.has(task.taskDate)) byDay.set(task.taskDate, []);
    byDay.get(task.taskDate).push(task);
  });
  return [...byDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, group]) => ({
      id: date,
      title: dayLabel(date, today),
      tone: 'plain',
      action: 'clearAll',
      tasks: [...group].sort((a, b) => String(b.completedAt || '').localeCompare(String(a.completedAt || '')))
    }));
};

/** What a section says when there is nothing in it */
export const emptyFor = (view) => ({
  today: { title: 'Nothing left for today', body: 'Add a task below, or enjoy the gap.' },
  important: { title: 'Nothing starred', body: 'Star a task and it will wait for you here.' },
  done: { title: 'Nothing finished yet', body: 'Tasks you tick off collect here.' }
}[view] || { title: 'Nothing here', body: '' });
