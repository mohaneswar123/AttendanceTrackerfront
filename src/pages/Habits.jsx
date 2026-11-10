import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useHabits from '../hooks/useHabits';
import { habitService } from '../services/api';
import { addDays, dueOrder, isDone, isSkipped, lastSevenDays, rateChange, rateLabel, todayIso } from '../utils/habits';
import FeatureShell from '../components/FeatureShell';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';
import { PlusIcon } from '../components/icons';
import HabitRow, { HabitConfigRow } from '../components/habits/HabitRow';
import HabitFormModal from '../components/habits/HabitFormModal';
import SkipDayModal from '../components/habits/SkipDayModal';
import HabitProgress from '../components/habits/HabitProgress';
import RangeProgress from '../components/habits/RangeProgress';
import TodayProgress from '../components/habits/TodayProgress';
import WeeklySummary from '../components/habits/WeeklySummary';

// Which section each address shows
const TAB_FOR_PATH = { '/habits': 'today', '/habits/all': 'habits', '/habits/progress': 'progress' };

function Habits() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        title="Build a habit"
        message="Log in to keep track of the things you want to do every day."
      />
    );
  }
  return <HabitsPage />;
}

function HabitsPage() {
  const { pathname } = useLocation();
  const tab = TAB_FOR_PATH[pathname] || 'today';
  const habits = useHabits({ includeArchived: true });
  const [form, setForm] = useState(null);       // { habit } to edit, or { initial } to create
  const [skipping, setSkipping] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [entries, setEntries] = useState([]);
  const [chosenHabit, setChosenHabit] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [range, setRange] = useState('WEEK');
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const today = todayIso();

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const active = useMemo(() => habits.habits.filter(habit => !habit.archived), [habits.habits]);
  const archived = useMemo(() => habits.habits.filter(habit => habit.archived), [habits.habits]);
  const due = useMemo(() => dueOrder(active), [active]);
  const doneToday = due.filter(isDone).length;
  const countedToday = due.filter(habit => !isSkipped(habit)).length;

  // The strip and the heatmap both read from the same range of marked days
  const loadEntries = useCallback(async () => {
    try {
      setEntries(await habitService.getEntries(addDays(today, -41), today));
    } catch {
      setEntries([]);
    }
  }, [today]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries, habits.habits.length]);

  const loadProgress = useCallback(async () => {
    if (tab !== 'progress') return;
    setProgressLoading(true);
    try {
      setProgress(await habitService.getProgress(range));
    } catch {
      setProgress(null);
    } finally {
      setProgressLoading(false);
    }
  }, [tab, range]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress, habits.habits.length]);

  // How much of each of the last seven days was kept, for the circles on the card
  const byDay = useMemo(() => {
    const share = {};
    lastSevenDays().forEach(day => {
      const dueThatDay = active.filter(habit => habit.schedule !== 'TIMES_PER_WEEK');
      const marks = entries.filter(entry => entry.date === day);
      const done = marks.filter(entry => entry.status === 'DONE').length;
      const skipped = marks.filter(entry => entry.status === 'SKIPPED').length;
      const outOf = Math.max(0, (day === today ? due.length : dueThatDay.length) - skipped);
      share[day] = outOf > 0 ? Math.min(1, done / outOf) : (done > 0 ? 1 : 0);
    });
    return share;
  }, [entries, active, due.length, today]);

  const closeForm = useCallback(() => setForm(null), []);
  const closeSkip = useCallback(() => setSkipping(null), []);
  const cancelDelete = useCallback(() => setDeleting(null), []);

  const withBusy = async (action) => {
    setBusy(true);
    const result = await action();
    setBusy(false);
    await loadEntries();
    return result;
  };

  // The circle: finish a yes/no habit, or add one to a count or time habit
  const handleDone = (habit) => withBusy(() => {
    if (isDone(habit)) return habits.clearMark(habit.id, today);
    if (habit.goal === 'YES_NO') return habits.mark(habit.id, today, { status: 'DONE' });
    const next = Math.min(habit.target, (habit.today?.amount ?? 0) + (habit.goal === 'DURATION' ? 5 : 1));
    return habits.mark(habit.id, today, {
      status: next >= habit.target ? 'DONE' : 'MISSED',
      amount: next
    });
  });

  const handleSkip = async (note) => {
    const habit = skipping;
    const result = await withBusy(() => habits.mark(habit.id, today, { status: 'SKIPPED', note }));
    if (result.success) setSkipping(null);
    return result;
  };

  const handleUndoSkip = (habit) => withBusy(() => habits.clearMark(habit.id, today));

  const handleSave = async (fields) => {
    const result = form.habit
      ? await habits.updateHabit(form.habit.id, fields)
      : await habits.createHabit(fields);
    if (result.success) {
      setForm(null);
      setNotice(form.habit ? 'Habit saved.' : `${result.habit.name} added.`);
    }
    return result;
  };

  const handleArchive = async (habit, archived) => {
    setForm(null);
    const result = await habits.setArchived(habit.id, archived);
    setNotice(result.success
      ? archived ? `${habit.name} archived. Its history is kept.` : `${habit.name} is back.`
      : result.message);
  };

  const handleDelete = async () => {
    const habit = deleting;
    setDeleting(null);
    setForm(null);
    const result = await habits.deleteHabit(habit.id);
    setNotice(result.success ? `${habit.name} deleted.` : result.message);
  };

  // A day picked out of the heatmap is marked done, or cleared if it already was
  const handleToggleDay = (habit, date, entry) => withBusy(() => (entry?.status === 'DONE'
    ? habits.clearMark(habit.id, date)
    : habits.mark(habit.id, date, { status: 'DONE' })));

  const weekRates = active.map(habit => habit.thisWeekRate).filter(rate => rate >= 0);
  const lastRates = active.map(habit => habit.lastWeekRate).filter(rate => rate >= 0);
  const mean = (list) => (list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : -1);
  const weekRate = mean(weekRates);
  const lastRate = mean(lastRates);
  const empty = !habits.loading && habits.habits.length === 0;

  return (
    <FeatureShell onAdd={() => setForm({ initial: null })}>
      {notice && <div className="notice notice-info" role="status">{notice}</div>}

      {habits.error && (
        <div className="notice notice-danger" role="alert">
          <span className="flex-1">{habits.error}</span>
          <button onClick={habits.clearError} className="text-rose-300 hover:text-white text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {habits.loading && habits.habits.length === 0 && <p className="text-slate-400">Loading your habits…</p>}

      {empty && (
        <section className="surface p-8 text-center" aria-label="No habits yet">
          <h2 className="font-semibold text-white">No habits yet</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            Start with something small and daily. The form suggests a few.
          </p>
          <button onClick={() => setForm({ initial: null })} className="btn bg-teal-500 text-white hover:bg-teal-600 px-5">
            Add your first habit
          </button>
        </section>
      )}

      {tab === 'today' && !empty && (
        <>
          <TodayProgress done={doneToday} due={countedToday} byDay={byDay} />
          {weekRate >= 0 && lastRate >= 0 && (
            <p className="text-xs text-slate-500 px-1">
              This week {rateLabel(weekRate)}, {rateChange(weekRate, lastRate)}.
            </p>
          )}

          {due.length === 0 ? (
            <section className="surface p-8 text-center" aria-label="Nothing due today">
              <h2 className="font-semibold text-white">Nothing due today</h2>
              <p className="text-sm text-slate-500 mt-1">
                None of your habits run today. The Habits tab is where you change that.
              </p>
            </section>
          ) : (
            <ul className="space-y-2" aria-label="Due today">
              {due.map(habit => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  busy={busy}
                  onDone={handleDone}
                  onSkip={setSkipping}
                  onUndoSkip={handleUndoSkip}
                  onOpen={(chosen) => setForm({ habit: chosen })}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'habits' && !empty && (
        <div className="space-y-3">
          <ul className="space-y-2" aria-label="All habits">
            {active.map(habit => (
              <HabitConfigRow key={habit.id} habit={habit} onOpen={(chosen) => setForm({ habit: chosen })} />
            ))}
          </ul>
          {active.length === 0 && (
            <p className="text-sm text-slate-500 px-1">Everything is archived. Restore one to start again.</p>
          )}

          <button
            onClick={() => setForm({ initial: null })}
            className="btn bg-teal-500 text-white hover:bg-teal-600 w-full"
          >
            <PlusIcon className="w-4 h-4" />
            New habit
          </button>

          {archived.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowArchived(open => !open)}
                aria-expanded={showArchived}
                className="text-sm font-semibold text-slate-400 hover:text-slate-200"
              >
                Archived habits ({archived.length})
              </button>
              {showArchived && (
                <>
                  <p className="text-xs text-slate-500 mt-1 mb-2">
                    Archived habits stop being due, and keep every day recorded against them.
                  </p>
                  <ul className="space-y-2">
                    {archived.map(habit => (
                      <HabitConfigRow key={habit.id} habit={habit} onOpen={(chosen) => setForm({ habit: chosen })} />
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'progress' && !empty && (
        <>
          <RangeProgress
            progress={progress}
            range={range}
            onRange={setRange}
            loading={progressLoading}
          />
          <WeeklySummary summary={habits.summary} />
          {active.length === 0 ? (
            <p className="text-sm text-slate-500 px-1">Restore a habit and its history will appear here.</p>
          ) : (
            <HabitProgress
              habits={active}
              entries={entries}
              selectedId={chosenHabit}
              onSelect={setChosenHabit}
              onToggleDay={handleToggleDay}
            />
          )}
        </>
      )}

      {form && (
        <HabitFormModal
          habit={form.habit}
          initial={form.initial}
          onSave={handleSave}
          onArchive={handleArchive}
          onDelete={setDeleting}
          onClose={closeForm}
        />
      )}

      {skipping && <SkipDayModal habit={skipping} onSkip={handleSkip} onClose={closeSkip} />}

      {deleting && (
        <ConfirmDialog
          title="Delete this habit?"
          message={`"${deleting.name}" will be removed. Habits with days recorded against them are archived instead, so the history is kept.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={cancelDelete}
        />
      )}
    </FeatureShell>
  );
}

export default Habits;
