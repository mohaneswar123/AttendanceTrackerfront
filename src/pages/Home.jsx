import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useHomeSummary from '../hooks/useHomeSummary';
import { FEATURES, toneOf } from '../features/registry';
import { lastTabs } from '../components/FeatureShell';
import ThemeToggle from '../components/ThemeToggle';
import LoginPrompt from '../components/LoginPrompt';
import { SettingsIcon } from '../components/icons';
import { longWeekday } from '../utils/attendance';
import { todayLocal } from '../utils/date';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/** The line under each tile: what that feature wants from the student today */
const statusOf = (id, summary) => {
  switch (id) {
    case 'attendance':
      return summary.timetable?.classes
        ? `${summary.timetable.classes} ${summary.timetable.classes === 1 ? 'class' : 'classes'} to mark`
        : 'Nothing to mark yet';
    case 'tasks': {
      if (!summary.tasks) return '';
      const { due, overdue, done } = summary.tasks;
      if (due + overdue === 0) return done > 0 ? 'All done today' : 'Nothing due today';
      // Overdue is named rather than folded into the total, so the tile cannot imply that
      // a day is clear when something from last week is still waiting.
      return [due > 0 ? `${due} due today` : '', overdue > 0 ? `${overdue} overdue` : '']
        .filter(Boolean).join(' · ');
    }
    case 'habits': {
      if (!summary.habits) return '';
      return summary.habits.due === 0
        ? 'Nothing due today'
        : `${summary.habits.done} of ${summary.habits.due} done today`;
    }
    case 'calendar':
      return 'Exams, deadlines and dates';
    case 'timetable':
      return summary.timetable?.modeName
        ? `${summary.timetable.modeName} · ${summary.timetable.classes} today`
        : 'No routine set up yet';
    case 'focus': {
      if (!summary.focus) return '';
      if (summary.focus.phase === 'FOCUS') return 'Focusing now';
      if (summary.focus.phase === 'BREAK') return 'On a break';
      return summary.focus.minutes > 0 ? `${summary.focus.minutes} min today` : 'Ready when you are';
    }
    default:
      return '';
  }
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
  const navigate = useNavigate();
  const { currentUser } = useContext(AttendanceContext);
  const summary = useHomeSummary();
  const remembered = lastTabs();

  const name = (currentUser?.username || '').split(' ')[0];

  const glance = [
    {
      id: 'attendance',
      label: 'Classes today',
      value: summary.timetable ? summary.timetable.classes : '—',
      path: '/timetable'
    },
    {
      id: 'tasks',
      label: 'Tasks due',
      value: summary.tasks ? summary.tasks.due + summary.tasks.overdue : '—',
      path: '/tasks'
    },
    {
      id: 'habits',
      label: 'Habits done',
      value: summary.habits ? `${summary.habits.done}/${summary.habits.due}` : '—',
      path: '/habits'
    },
    {
      id: 'focus',
      label: 'Focus minutes',
      value: summary.focus ? summary.focus.minutes : '—',
      path: '/focus'
    }
  ];

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{longWeekday(todayLocal())}</p>
          <h1 className="text-[28px] leading-8 font-bold tracking-tight text-white">
            {greeting()}{name ? `, ${name}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle compact />
          <Link
            to="/settings"
            aria-label="Settings"
            title="Settings"
            className="w-11 h-11 md:w-10 md:h-10 rounded-full grid place-items-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <SettingsIcon />
          </Link>
        </div>
      </header>

      <section className="surface p-4" aria-label="Today at a glance">
        <h2 className="section-title mb-3">Today at a glance</h2>
        <div className="grid grid-cols-4 gap-2">
          {glance.map(stat => {
            const tone = toneOf(stat.id);
            return (
              <button
                key={stat.id}
                type="button"
                onClick={() => navigate(stat.path)}
                className="rounded-xl bg-background-surface px-2 py-2.5 text-center hover:bg-white/5 transition-colors"
              >
                <p className={`text-xl font-bold tabular-nums ${tone.text}`}>{stat.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{stat.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Your apps" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Your apps</h2>
          <span className="text-xs text-slate-500">{FEATURES.length} apps</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(feature => {
            const tone = toneOf(feature.id);
            const to = remembered[feature.id] || feature.tabs[0].path;
            return (
              <Link
                key={feature.id}
                to={to}
                className="surface p-4 flex flex-col gap-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`w-11 h-11 rounded-xl grid place-items-center ${tone.tint} ${tone.text}`}>
                    <feature.Icon className="w-5 h-5" />
                  </span>
                  {feature.isNew && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tone.tint} ${tone.text}`}>
                      NEW
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{feature.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {summary.loading ? 'Loading…' : statusOf(feature.id, summary)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="rounded-xl border border-dashed border-line p-4 text-center">
          <p className="text-sm text-slate-500">New apps appear here as they ship.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
