import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useHomeSummary from '../hooks/useHomeSummary';
import { FEATURES, toneOf } from '../features/registry';
import { lastTabs } from '../components/FeatureShell';
import ThemeToggle from '../components/ThemeToggle';
import LoginPrompt from '../components/LoginPrompt';
import { ChevronRightIcon, SettingsIcon } from '../components/icons';
import { longWeekday, tally } from '../utils/attendance';
import { nowHour, todayLocal } from '../utils/date';

const greeting = () => {
  const hour = nowHour();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/** The part of the day the card is about, so "left today" has an edge to it */
const partOfDay = () => {
  const hour = nowHour();
  if (hour < 12) return 'This morning';
  if (hour < 17) return 'This afternoon';
  return 'Tonight';
};

/** Up to three names, then "and N more", so a subtitle never runs away */
const nameList = (names, limit = 2) => {
  if (names.length <= limit) return names.join(', ');
  return `${names.slice(0, limit).join(', ')} and ${names.length - limit} more`;
};

/**
 * What each feature puts on its tile: one figure, its unit, and a line under it.
 *
 * Each entry reads its own feature and nothing else. The attendance tile in particular
 * counts what has been marked, not what the timetable says should be marked — a student
 * with no timetable set up would otherwise see a tile about a feature they never opened.
 */
const tileOf = (id, summary) => {
  switch (id) {
    case 'attendance': {
      const { percentage, markedToday } = summary.attendance;
      if (percentage === null) return { value: '—', unit: '', caption: 'Nothing recorded yet' };
      return {
        value: percentage,
        unit: '%',
        caption: markedToday > 0
          ? `${markedToday} marked today`
          : 'Nothing marked today'
      };
    }
    case 'tasks': {
      if (!summary.tasks) return { value: '—', unit: '', caption: '' };
      const { due, overdue, done } = summary.tasks;
      if (due + overdue === 0) {
        return { value: done, unit: 'done', caption: done > 0 ? 'All done today' : 'Nothing due today' };
      }
      return {
        value: due,
        unit: 'due',
        // The tile already reads "1 due"; repeating "due today" under it is noise
        caption: overdue > 0 ? `${overdue} overdue` : ''
      };
    }
    case 'habits': {
      if (!summary.habits) return { value: '—', unit: '', caption: '' };
      const { due, done } = summary.habits;
      if (due === 0) return { value: '0', unit: '', caption: 'Nothing due today' };
      return { value: done, unit: `/${due}`, caption: '' };
    }
    case 'calendar': {
      if (!summary.calendar) return { value: '—', unit: '', caption: '' };
      const { today: count, next } = summary.calendar;
      if (count === 0) return { value: 0, unit: 'today', caption: 'Nothing on today' };
      return {
        value: count,
        unit: 'today',
        caption: next ? [next.title, next.time].filter(Boolean).join(', ') : ''
      };
    }
    case 'timetable': {
      if (!summary.timetable) return { value: '—', unit: '', caption: '' };
      const { classes, modeName } = summary.timetable;
      return {
        value: classes,
        unit: classes === 1 ? 'class' : 'classes',
        caption: modeName || 'No routine set up yet'
      };
    }
    case 'focus': {
      if (!summary.focus) return { value: '—', unit: '', caption: '' };
      if (summary.focus.phase === 'FOCUS') return { value: 'Now', unit: '', caption: 'Focusing' };
      if (summary.focus.phase === 'BREAK') return { value: 'Now', unit: '', caption: 'On a break' };
      return {
        value: summary.focus.minutes,
        unit: 'min',
        caption: summary.focus.minutes > 0 ? '' : 'Start a session'
      };
    }
    default:
      return { value: '—', unit: '', caption: '' };
  }
};

/**
 * What is actually left to do, across the apps, in the order it is worth doing.
 *
 * Only features with something outstanding appear, so the card is a short list of real
 * work rather than a status board that always says six things.
 */
const thingsLeft = (summary, subjectsLeft) => {
  const rows = [];

  if (subjectsLeft.length > 0) {
    rows.push({
      id: 'attendance',
      title: `Mark ${subjectsLeft.length} ${subjectsLeft.length === 1 ? 'class' : 'classes'}`,
      detail: `Attendance · ${nameList(subjectsLeft)}`,
      path: '/attendance'
    });
  }

  const tasks = summary.tasks;
  if (tasks && tasks.due + tasks.overdue > 0) {
    const total = tasks.due + tasks.overdue;
    rows.push({
      id: 'tasks',
      title: `Finish ${total} ${total === 1 ? 'task' : 'tasks'}`,
      detail: `Tasks · ${tasks.overdue > 0 ? `${tasks.overdue} ${tasks.overdue === 1 ? 'is' : 'are'} overdue` : 'due today'}`,
      path: '/tasks'
    });
  }

  const habits = summary.habits;
  if (habits && habits.due - habits.done > 0) {
    const left = habits.due - habits.done;
    rows.push({
      id: 'habits',
      title: `Do ${left} more ${left === 1 ? 'habit' : 'habits'}`,
      detail: `Habits · ${nameList(habits.left || [])}`,
      path: '/habits'
    });
  }

  return rows;
};

function Home() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        title="Your student apps"
        message="Log in to see today across attendance, tasks, habits and the rest."
      />
    );
  }
  return <HomeHub />;
}

function HomeHub() {
  const { currentUser, subjects, attendanceRecords } = useContext(AttendanceContext);
  const summary = useHomeSummary();
  const remembered = lastTabs();

  const name = (currentUser?.username || '').split(' ')[0];
  const today = todayLocal();

  // Attendance's own numbers, from the records the context already loaded
  const records = useMemo(() => attendanceRecords || [], [attendanceRecords]);
  const markedToday = useMemo(
    () => records.filter(record => String(record.date).slice(0, 10) === today),
    [records, today]
  );
  const attendance = {
    percentage: tally(records).percentage,
    markedToday: markedToday.length
  };

  // The subjects with nothing against them today, named
  const subjectsLeft = useMemo(() => {
    const done = new Set(markedToday.map(record => record.subjectId));
    return (subjects || []).filter(subject => !done.has(subject._id)).map(subject => subject.name);
  }, [subjects, markedToday]);

  const full = { ...summary, attendance };
  const rows = summary.loading ? [] : thingsLeft(full, subjectsLeft);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{longWeekday(today)}</p>
          <h1 className="text-[28px] leading-[1.15] font-bold tracking-tight text-white mt-0.5">
            {greeting()}{name ? `, ${name}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle compact />
          <Link
            to="/settings"
            aria-label="Settings"
            title="Settings"
            className="w-11 h-11 rounded-full grid place-items-center bg-background-paper text-slate-400 hover:text-white transition-colors"
          >
            <SettingsIcon />
          </Link>
        </div>
      </header>

      {/* The one card that says what is actually left, rather than what exists */}
      <section className="rounded-2xl bg-nav p-4 space-y-2.5" aria-label="Left to do today">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold text-nav-ink">
            {summary.loading
              ? 'Today'
              : rows.length === 0
                ? 'Nothing left today'
                : `${rows.length} ${rows.length === 1 ? 'thing' : 'things'} left today`}
          </h2>
          <span className="text-sm text-nav-ink/60 shrink-0">{partOfDay()}</span>
        </div>

        {summary.loading ? (
          <p className="text-sm text-nav-ink/60">Looking at your day…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-nav-ink/60">
            Everything due today is done. Anything you add will show up here.
          </p>
        ) : (
          rows.map(row => {
            const tone = toneOf(row.id);
            return (
              <Link
                key={row.id}
                to={row.path}
                className="flex items-center gap-3 rounded-xl bg-nav-ink/10 p-3 hover:bg-nav-ink/15 transition-colors"
              >
                <span className={`w-9 h-9 shrink-0 rounded-full border-2 border-nav-ink/30 grid place-items-center ${tone.text}`} aria-hidden="true">
                  <span className="w-2 h-2 rounded-full bg-current" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-nav-ink">{row.title}</span>
                  <span className="block text-xs text-nav-ink/60">{row.detail}</span>
                </span>
                <ChevronRightIcon className="w-4 h-4 shrink-0 text-nav-ink/40" aria-hidden="true" />
              </Link>
            );
          })
        )}
      </section>

      <section aria-label="Your apps" className="space-y-3">
        <h2 className="text-xl font-bold text-white">Your apps</h2>

        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(feature => {
            const tone = toneOf(feature.id);
            const to = remembered[feature.id] || feature.tabs[0].path;
            const tile = summary.loading ? null : tileOf(feature.id, full);
            return (
              <Link
                key={feature.id}
                to={to}
                className={`rounded-2xl p-3 flex flex-col gap-2 transition-opacity hover:opacity-90 ${tone.tint}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`w-9 h-9 rounded-xl grid place-items-center bg-background-paper ${tone.text}`}>
                    <feature.Icon className="w-[18px] h-[18px]" />
                  </span>
                  {feature.isNew && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-light-primary text-background">
                      NEW
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  {/* A shimmer, not an em dash: "—" and "Loading..." read as the answer */}
                  {tile === null ? (
                    <span className="block h-7 w-16 rounded-md bg-background-paper/70 animate-pulse" aria-hidden="true" />
                  ) : (
                    <p className="text-2xl leading-none font-bold tabular-nums text-white">
                      {tile.value}
                      {tile.unit && <span className="text-sm font-semibold text-slate-400 ml-1">{tile.unit}</span>}
                    </p>
                  )}
                  <p className="font-bold text-white mt-1.5 truncate">{feature.name}</p>
                  {tile?.caption && <p className="text-sm text-slate-400 truncate">{tile.caption}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;
