import { useCallback, useEffect, useState } from 'react';
import {
  calendarService, habitService, pomodoroService, taskService, timetableService
} from '../services/api';
import { todayLocal } from '../utils/date';
import { todayDay } from '../utils/timetable';

/**
 * The live lines on the Home screen: enough from each feature to say whether it needs
 * attention today, and nothing more.
 *
 * Each feature is fetched on its own and allowed to fail on its own. A timetable that
 * will not load should leave its tile saying nothing, not take the whole screen down.
 *
 * Every entry here reads one feature and only that feature. The attendance line used to
 * come from the timetable's class count, which made a tile depend on a feature the
 * student may never have set up. Attendance itself is not fetched here at all: the
 * context already holds the student's records, so Home works them out from those.
 */
export default function useHomeSummary() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const today = todayLocal();

    const settle = async (key, run) => {
      try {
        return [key, await run()];
      } catch {
        return [key, null];
      }
    };

    const results = await Promise.all([
      settle('calendar', async () => {
        const events = await calendarService.getEvents({ from: today, to: today });
        return { today: events.length };
      }),
      // Everything up to and including today, not just today: work left unfinished on an
      // earlier day is still waiting, and the tile would otherwise say the day was clear.
      settle('tasks', async () => {
        const tasks = await taskService.getTasks({ to: today });
        const open = tasks.filter(task => task.status !== 'DONE');
        return {
          due: open.filter(task => task.taskDate === today).length,
          overdue: open.filter(task => task.taskDate < today).length,
          done: tasks.filter(task => task.status === 'DONE' && task.taskDate === today).length
        };
      }),
      settle('habits', async () => {
        const habits = await habitService.getHabits();
        const due = habits.filter(habit => habit.dueToday);
        return { due: due.length, done: due.filter(habit => habit.today?.status === 'DONE').length };
      }),
      settle('timetable', async () => {
        const modes = await timetableService.getModes();
        const active = modes.find(mode => mode.active) || modes[0];
        if (!active) return { classes: 0, modeName: null };
        const activities = await timetableService.getActivities(active.id);
        const day = todayDay();
        return {
          classes: activities.filter(activity => activity.dayOfWeek === day).length,
          modeName: active.name
        };
      }),
      settle('focus', async () => {
        const [state, totals] = await Promise.all([
          pomodoroService.getCurrent(),
          pomodoroService.getToday().catch(() => ({ minutes: 0 }))
        ]);
        return { phase: state.phase, remainingSeconds: state.remainingSeconds, minutes: totals.minutes ?? 0 };
      })
    ]);

    setData(Object.fromEntries(results));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, reload: load };
}
