import React, { useMemo } from 'react';
import {
  DAYS, DAY_SHORT, STATUS_CELL, STATUS_LABEL, heatmapWeeks, rateLabel, shortDay, streakUnit, todayIso
} from '../../utils/habits';
import { FlameIcon } from '../icons';

const LEGEND = [
  { label: 'Done', cell: STATUS_CELL.DONE },
  { label: 'Skipped', cell: STATUS_CELL.SKIPPED },
  { label: 'Missed', cell: STATUS_CELL.MISSED },
  { label: 'Still to come', cell: 'border border-dashed border-line' }
];

/**
 * One habit's history: the three figures that matter, then five weeks as a grid.
 *
 * Weeks are rows and weekdays are columns, so a habit that always goes wrong on Fridays
 * shows up as a column rather than something you have to count out.
 *
 * It only shows. Marking a day is done on Today, where the day is in front of you and the
 * three states are spelled out; a grid of small squares is a poor place to decide that a
 * day in the past was really a skip, and an easy place to change one by accident.
 */
function HabitProgress({ habits, entries, selectedId, onSelect }) {
  const weeks = useMemo(() => heatmapWeeks(5), []);
  const today = todayIso();
  const habit = habits.find(item => item.id === selectedId) || habits[0];

  const byDate = useMemo(() => {
    const map = {};
    if (!habit) return map;
    entries.filter(entry => entry.habitId === habit.id).forEach(entry => { map[entry.date] = entry; });
    return map;
  }, [entries, habit]);

  if (!habit) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-white px-1">Habit calendar</h3>

      {habits.length > 1 && (
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1" role="tablist" aria-label="Choose a habit">
          {habits.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === habit.id}
              onClick={() => onSelect(item.id)}
              className={`h-9 px-3 shrink-0 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${item.id === habit.id
                ? 'bg-teal-500 text-white'
                : 'bg-background-surface text-slate-400 hover:text-slate-200'}`}
            >
              <span aria-hidden="true">{item.icon}</span> {item.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="surface px-3 py-2.5">
          <p className="text-xl font-bold tabular-nums text-amber-500 flex items-center gap-1">
            <FlameIcon className="w-4 h-4" aria-hidden="true" />
            {habit.currentStreak}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Current streak</p>
        </div>
        <div className="surface px-3 py-2.5">
          <p className="text-xl font-bold tabular-nums text-white">{habit.bestStreak}</p>
          <p className="text-xs text-slate-500 mt-0.5">Best streak</p>
        </div>
        <div className="surface px-3 py-2.5">
          <p className="text-xl font-bold tabular-nums text-teal-300">{rateLabel(habit.last30Rate)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Kept, 30 days</p>
        </div>
      </div>

      <section className="surface p-4" aria-label={`${habit.name} over the last five weeks`}>
        <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden="true">
          {DAYS.map(day => (
            <span key={day} className="text-center text-[10px] font-semibold text-slate-500">
              {DAY_SHORT[day].slice(0, 1)}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map(week => (
            <div key={week[0]} className="grid grid-cols-7 gap-1">
              {week.map(date => {
                const entry = byDate[date];
                const future = date > today;
                const isToday = date === today;
                const label = `${shortDay(date)}: ${entry ? STATUS_LABEL[entry.status] : future ? 'still to come' : 'not marked'}`;
                return (
                  <span
                    key={date}
                    role="img"
                    title={label}
                    aria-label={label}
                    className={`aspect-square rounded-md
                      ${future ? 'border border-dashed border-line'
                        : entry ? STATUS_CELL[entry.status]
                          : 'bg-background-surface'}
                      ${isToday ? 'ring-2 ring-teal-500' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
          {LEGEND.map(item => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${item.cell}`} aria-hidden="true" />
              {item.label}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-3">
          Best run so far: {streakUnit(habit, habit.bestStreak)}.
        </p>
      </section>
    </div>
  );
}

export default HabitProgress;
