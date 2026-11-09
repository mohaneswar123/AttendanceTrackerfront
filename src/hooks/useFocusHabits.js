import { useCallback, useEffect, useRef, useState } from 'react';
import { habitService } from '../services/api';
import { todayIso } from '../utils/habits';

const CHOSEN_KEY = 'focusCountsTowards';

const readChosen = () => {
  try {
    return localStorage.getItem(CHOSEN_KEY) || null;
  } catch {
    return null;
  }
};

/**
 * The link between the focus timer and a time-based habit.
 *
 * Which habit the minutes go to is the student's choice rather than a guess, because a
 * wrong guess quietly inflates a streak, and a streak nobody earned is worse than one
 * that needs a tap. The choice is kept on this device and only offered for time-based
 * habits that are due today.
 */
export default function useFocusHabits() {
  const [habits, setHabits] = useState([]);
  const [chosenId, setChosenId] = useState(readChosen);
  const [lastCredited, setLastCredited] = useState('');
  const chosen = useRef(chosenId);
  chosen.current = chosenId;
  const list = useRef(habits);
  list.current = habits;

  const load = useCallback(async () => {
    try {
      const all = await habitService.getHabits();
      setHabits(all.filter(habit => habit.goal === 'DURATION' && habit.dueToday));
    } catch {
      // The timer is the point of this page; a habit list that will not load is not
      // worth an error message here
      setHabits([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // A habit that was archived or finished stops being an option, so forget it
  useEffect(() => {
    if (chosenId && habits.length > 0 && !habits.some(habit => habit.id === chosenId)) {
      setChosenId(null);
    }
  }, [habits, chosenId]);

  const choose = useCallback((habitId) => {
    setChosenId(habitId);
    try {
      if (habitId) localStorage.setItem(CHOSEN_KEY, habitId);
      else localStorage.removeItem(CHOSEN_KEY);
    } catch {
      // The choice just will not be remembered next time
    }
  }, []);

  /** Called when a focus period finishes, with how many minutes it ran for */
  const credit = useCallback(async (minutes) => {
    const habitId = chosen.current;
    const habit = list.current.find(item => item.id === habitId);
    if (!habit) return;

    const amount = Math.min(habit.target, (habit.today?.amount ?? 0) + minutes);
    try {
      const updated = await habitService.mark(habit.id, todayIso(), {
        status: amount >= habit.target ? 'DONE' : 'MISSED',
        amount
      });
      setHabits(current => current.map(item => (item.id === updated.id ? updated : item)));
      setLastCredited(amount >= updated.target
        ? `${minutes} min added. ${updated.name} is done for today.`
        : `${minutes} min added to ${updated.name}: ${amount} of ${updated.target} min.`);
    } catch {
      setLastCredited('Those minutes could not be added to your habit.');
    }
  }, []);

  return { habits, chosenId, choose, credit, lastCredited, reload: load };
}
