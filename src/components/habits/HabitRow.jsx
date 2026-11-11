import React from 'react';
import {
  GOAL_CHIP, colorOf, goalLabel, goalProgress, isDone, isSkipped, metaLabel, scheduleLabel, streakUnit
} from '../../utils/habits';
import { CheckIcon, ChevronRightIcon, FlameIcon } from '../icons';

/**
 * One habit on the Today list.
 *
 * The circle is the whole point: one tap finishes a yes/no habit, and adds one to a count
 * habit. Skip sits beside it as its own button rather than inside a menu, because the
 * three states only help if the gentle one is as easy to reach as the other two.
 *
 * The row is not a way into the form. Today is for doing the habits; changing what they
 * are belongs on the Habits section, where that is the whole purpose of the screen and a
 * mis-tap cannot land you in a form you did not want.
 */
function HabitRow({ habit, onDone, onSkip, onUndoSkip, busy }) {
  const done = isDone(habit);
  const skipped = isSkipped(habit);
  const counted = habit.goal !== 'YES_NO';
  const amount = habit.today?.amount ?? 0;
  const progress = goalProgress(habit);

  const circleLabel = done
    ? `Undo ${habit.name}`
    : counted
      ? `Add one to ${habit.name}`
      : `Mark ${habit.name} done`;

  const tone = colorOf(habit.color);
  const left = Math.max(0, (habit.target || 0) - amount);
  const reached = counted && amount >= (habit.target || 0);

  return (
    <li className={`surface p-3 ${skipped ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        {/* The habit's own icon, so a list of five is read by shape rather than by reading */}
        <span className={`w-11 h-11 shrink-0 rounded-full grid place-items-center text-lg ${tone.soft}`} aria-hidden="true">
          {habit.icon}
        </span>

        <div className="flex-1 min-w-0">
          <p className={`font-bold truncate ${skipped ? 'text-slate-400' : 'text-white'}`}>
            {habit.name}
          </p>
          <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
            <span>{metaLabel(habit)}</span>
            {habit.reminderTime && <span>· {habit.reminderTime}</span>}
            {habit.currentStreak > 0 && (
              <span className="inline-flex items-center gap-0.5 text-amber-500">
                <FlameIcon className="w-3 h-3" aria-hidden="true" />
                {habit.currentStreak}
              </span>
            )}
          </p>
        </div>

        {skipped ? (
          <button type="button" onClick={() => onUndoSkip(habit)} disabled={busy} className="btn btn-secondary shrink-0">
            Undo
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onSkip(habit)}
              disabled={busy || done}
              className="h-11 px-2 shrink-0 text-sm font-bold text-slate-400 hover:text-slate-200 disabled:opacity-40"
            >
              Skip
            </button>
            {/* The one tap the row exists for: finish it, or add one more towards the goal */}
            <button
              type="button"
              onClick={() => onDone(habit)}
              disabled={busy}
              aria-pressed={done}
              aria-label={circleLabel}
              className={`w-11 h-11 shrink-0 rounded-full border-2 grid place-items-center text-sm font-bold transition-colors disabled:opacity-50 ${done
                ? `${tone.dot} border-transparent text-white`
                : 'border-line text-slate-400 hover:border-habits hover:text-habits'}`}
            >
              {done ? <CheckIcon className="w-5 h-5" /> : counted ? '+1' : <CheckIcon className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>

      {counted && !skipped && (
        <div className="mt-2.5 ml-14 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-background-surface overflow-hidden">
            <div className={`h-full rounded-full transition-[width] ${tone.dot}`} style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-xs text-slate-500 shrink-0">
            {reached ? 'Goal reached' : `${left} ${habit.unit || ''} to go`.trim()}
          </span>
        </div>
      )}

      {skipped && habit.today?.note && (
        <p className="mt-2 ml-14 text-xs text-slate-500 truncate">Skipped for today · {habit.today.note}</p>
      )}
    </li>
  );
}

/** The same habit on the Habits tab, where it is configured rather than ticked */
export function HabitConfigRow({ habit, onOpen }) {
  const tone = colorOf(habit.color);
  const goal = goalLabel(habit);

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(habit)}
        className="w-full surface p-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className={`w-11 h-11 shrink-0 rounded-xl grid place-items-center text-lg ${tone.soft}`} aria-hidden="true">
          {habit.icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-white truncate">{habit.name}</span>
          <span className="block text-xs text-slate-500 truncate">
            {scheduleLabel(habit)}
            {habit.reminderTime ? ` · ${habit.reminderTime}` : ' · no reminder'}
          </span>
        </span>
        <span className="badge badge-neutral shrink-0">{GOAL_CHIP[habit.goal]}{goal ? ` · ${goal}` : ''}</span>
        {habit.currentStreak > 0 && (
          <span className="hidden sm:inline-flex items-center gap-0.5 text-xs text-amber-500 shrink-0">
            <FlameIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {streakUnit(habit, habit.currentStreak)}
          </span>
        )}
        <ChevronRightIcon className="w-4 h-4 shrink-0 text-slate-500" aria-hidden="true" />
      </button>
    </li>
  );
}

export default HabitRow;
