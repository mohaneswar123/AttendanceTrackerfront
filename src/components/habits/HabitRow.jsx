import React from 'react';
import {
  GOAL_CHIP, colorOf, goalLabel, goalProgress, isDone, isSkipped, metaLabel, scheduleLabel, streakUnit
} from '../../utils/habits';
import { CheckIcon, ChevronRightIcon, FlameIcon, MinusIcon } from '../icons';

/**
 * One habit on the Today list.
 *
 * The circle is the whole point: one tap finishes a yes/no habit, and adds one to a count
 * habit. Skip sits beside it as its own button rather than inside a menu, because the
 * three states only help if the gentle one is as easy to reach as the other two.
 */
function HabitRow({ habit, onDone, onSkip, onUndoSkip, onOpen, busy }) {
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

  return (
    <li className={`surface p-3 ${skipped ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onDone(habit)}
          disabled={busy || skipped}
          aria-pressed={done}
          aria-label={circleLabel}
          className={`w-11 h-11 shrink-0 rounded-full border-2 grid place-items-center text-lg transition-colors disabled:opacity-50 ${done
            ? 'bg-teal-500 border-teal-500 text-white'
            : skipped
              ? 'bg-background-surface border-line text-slate-500'
              : 'border-line text-slate-500 hover:border-teal-500'}`}
        >
          {done ? <CheckIcon className="w-5 h-5" />
            : skipped ? <MinusIcon className="w-4 h-4" />
              : <span aria-hidden="true">{habit.icon}</span>}
        </button>

        <button type="button" onClick={() => onOpen(habit)} className="flex-1 min-w-0 text-left">
          <p className={`font-semibold text-white truncate ${done ? 'line-through text-slate-400' : ''}`}>
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
        </button>

        {skipped ? (
          <button type="button" onClick={() => onUndoSkip(habit)} disabled={busy} className="btn btn-secondary shrink-0">
            Undo
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSkip(habit)}
            disabled={busy || done}
            className="btn btn-ghost shrink-0 disabled:opacity-40"
          >
            Skip
          </button>
        )}
      </div>

      {counted && !skipped && (
        <div className="mt-2.5 ml-14 h-1.5 rounded-full bg-background-surface overflow-hidden">
          <div className="h-full rounded-full bg-teal-500 transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {skipped && habit.today?.note && (
        <p className="mt-2 ml-14 text-xs text-slate-500 truncate">Skipped · {habit.today.note}</p>
      )}

      {counted && !skipped && amount > 0 && amount < habit.target && (
        <p className="sr-only">{amount} of {habit.target} so far</p>
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
        <span className={`w-10 h-10 shrink-0 rounded-xl grid place-items-center text-lg border ${tone.soft}`} aria-hidden="true">
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
