import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import usePomodoro from '../hooks/usePomodoro';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import DurationPicker from '../components/pomodoro/DurationPicker';
import { PlayIcon, ResetIcon, SkipIcon, SpeakerIcon } from '../components/icons';

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FOCUS_PRESETS = [15, 25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];
const LONG_BREAK_PRESETS = [15, 20, 30];
const MAX_FOCUS = 120;
const MAX_BREAK = 30;
const TIMES_KEY = 'pomodoroTimes';

const formatClock = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// The student's last chosen lengths on this device
function loadTimes() {
  try {
    const saved = JSON.parse(localStorage.getItem(TIMES_KEY));
    const valid = (n, max) => Number.isInteger(n) && n >= 1 && n <= max;
    if (valid(saved?.focusMinutes, MAX_FOCUS) && valid(saved?.breakMinutes, MAX_BREAK)) {
      return { longBreakMinutes: 15, ...saved };
    }
  } catch {
    // Fall back to the defaults
  }
  return { focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15 };
}

function saveTimes(times) {
  try {
    localStorage.setItem(TIMES_KEY, JSON.stringify(times));
  } catch {
    // The choice just won't be remembered
  }
}

// A long break is simply a longer break, so both are the same setting with two lengths
const breakFor = (kind, times) =>
  (kind === 'LONG' ? times.longBreakMinutes || 15 : times.breakMinutes);

function Pomodoro() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        title="Focus with Pomodoro"
        message="Log in to use the focus timer with short breaks."
      />
    );
  }
  return <PomodoroTimer />;
}

function PomodoroTimer() {
  const pomodoro = usePomodoro(true);
  const [times, setTimes] = useState(loadTimes);
  const [breakKind, setBreakKind] = useState('SHORT');
  const [confirmReset, setConfirmReset] = useState(false);
  const cancelReset = useCallback(() => setConfirmReset(false), []);
  const originalTitle = useRef(document.title);

  const { timer, remainingSeconds, busy } = pomodoro;
  const phase = timer?.phase ?? 'IDLE';
  const idle = phase === 'IDLE';
  const paused = phase === 'FOCUS' && timer.paused;

  // While idle the clock shows the focus time the student has picked
  const shownSeconds = idle ? times.focusMinutes * 60 : remainingSeconds;
  const clock = !timer ? '--:--' : formatClock(shownSeconds);
  const label = !timer ? 'Loading'
    : phase === 'BREAK' ? 'Break'
      : phase === 'FOCUS' ? (paused ? 'Paused' : 'Focus')
        : 'Ready to focus';

  const fraction = !idle && timer.totalSeconds > 0 && remainingSeconds != null
    ? Math.min(1, remainingSeconds / timer.totalSeconds)
    : 1;
  const ringColour = phase === 'BREAK' ? 'text-emerald-500' : paused ? 'text-amber-500' : 'text-primary-500';

  const chooseTimes = (changes) => {
    setTimes(current => {
      const next = { ...current, ...changes };
      saveTimes(next);
      return next;
    });
  };

  // Show the countdown in the tab while this page is open
  useEffect(() => {
    document.title = idle ? originalTitle.current : `${clock} · ${label}`;
  }, [idle, clock, label]);
  useEffect(() => {
    const title = originalTitle.current;
    return () => { document.title = title; };
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Pomodoro" title="Focus">
        <button
          onClick={pomodoro.toggleMute}
          aria-pressed={pomodoro.muted}
          aria-label={pomodoro.muted ? 'Turn sound on' : 'Mute sound'}
          className="btn btn-secondary rounded-full h-10 px-4"
        >
          <SpeakerIcon className="w-4 h-4" muted={pomodoro.muted} />
          {pomodoro.muted ? 'Sound off' : 'Sound on'}
        </button>
      </PageHeader>

      {/* What the next break should be. The lengths are the student's own choice, so these
          two only decide which of them the next break uses. */}
      <Tabs
        label="What is next"
        items={[
          { value: 'FOCUS', label: 'Focus' },
          { value: 'SHORT', label: 'Short break' },
          { value: 'LONG', label: 'Long break' }
        ]}
        value={idle ? (breakKind === 'LONG' ? 'LONG' : 'FOCUS') : (phase === 'BREAK' ? breakKind : 'FOCUS')}
        onChange={(next) => setBreakKind(next === 'LONG' ? 'LONG' : 'SHORT')}
      />

      {pomodoro.error && <div className="notice notice-danger" role="alert">{pomodoro.error}</div>}

      <div className="surface p-5 sm:p-8 flex flex-col items-center">
        {/* Countdown ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 288 288" aria-hidden="true">
            <circle cx="144" cy="144" r={RADIUS} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-background-surface" />
            <circle
              cx="144" cy="144" r={RADIUS} stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
              strokeLinecap="round"
              className={`${ringColour} transition-[stroke-dashoffset] duration-300 ease-linear`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" role="timer" aria-live="off">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="mt-1 text-5xl font-bold text-white tabular-nums tracking-tight">{clock}</span>
          </div>
        </div>

        {/* Reset, the main action, and skip — the main one large and in the middle */}
        <div className="w-full max-w-sm mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setConfirmReset(true)}
            disabled={busy || idle}
            aria-label="Reset the timer"
            className="w-12 h-12 shrink-0 rounded-full border border-line text-slate-400 grid place-items-center disabled:opacity-40 hover:text-slate-200 transition-colors"
          >
            <ResetIcon className="w-5 h-5" />
          </button>

          {idle && (
            <button
              onClick={() => pomodoro.start(times.focusMinutes, breakFor(breakKind, times))}
              disabled={busy || !timer}
              className="btn btn-primary flex-1 h-14 rounded-full text-base"
            >
              <PlayIcon className="w-5 h-5" />
              Start
            </button>
          )}
          {phase === 'FOCUS' && !paused && (
            <button onClick={pomodoro.pause} disabled={busy} className="btn btn-primary flex-1 h-14 rounded-full text-base">Pause</button>
          )}
          {phase === 'FOCUS' && paused && (
            <button onClick={pomodoro.resume} disabled={busy} className="btn btn-primary flex-1 h-14 rounded-full text-base">
              <PlayIcon className="w-5 h-5" />
              Resume
            </button>
          )}
          {phase === 'BREAK' && (
            <button onClick={pomodoro.skipBreak} disabled={busy} className="btn btn-primary flex-1 h-14 rounded-full text-base">Skip break</button>
          )}

          <button
            onClick={pomodoro.skipBreak}
            disabled={busy || phase !== 'BREAK'}
            aria-label="Skip the break"
            className="w-12 h-12 shrink-0 rounded-full border border-line text-slate-400 grid place-items-center disabled:opacity-40 hover:text-slate-200 transition-colors"
          >
            <SkipIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-5 text-xs text-slate-500 text-center">
          The timer keeps running if you leave this page or close the app.
        </p>
      </div>

      {/* Choosing lengths, only before starting; the ring above shows the choice */}
      {idle && timer && (
        <div className="surface p-4 space-y-4">
          <DurationPicker
            label="Focus length"
            name="Focus"
            value={times.focusMinutes}
            presets={FOCUS_PRESETS}
            max={MAX_FOCUS}
            onChange={(focusMinutes) => chooseTimes({ focusMinutes })}
          />
          <DurationPicker
            label={breakKind === 'LONG' ? 'Long break' : 'Break'}
            name={breakKind === 'LONG' ? 'Long break' : 'Break'}
            value={breakFor(breakKind, times)}
            presets={breakKind === 'LONG' ? LONG_BREAK_PRESETS : BREAK_PRESETS}
            max={MAX_BREAK}
            onChange={(minutes) => chooseTimes(breakKind === 'LONG' ? { longBreakMinutes: minutes } : { breakMinutes: minutes })}
          />
        </div>
      )}

      {confirmReset && (
        <ConfirmDialog
          title="Reset timer?"
          message="This session won't be counted."
          confirmLabel="Reset"
          danger
          onConfirm={() => {
            setConfirmReset(false);
            pomodoro.reset();
          }}
          onCancel={cancelReset}
        />
      )}
    </div>
  );
}

export default Pomodoro;
