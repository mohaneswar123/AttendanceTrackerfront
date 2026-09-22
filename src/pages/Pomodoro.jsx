import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import usePomodoro from '../hooks/usePomodoro';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';
import DurationPicker from '../components/pomodoro/DurationPicker';

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FOCUS_PRESETS = [15, 25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];
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
    if (valid(saved?.focusMinutes, MAX_FOCUS) && valid(saved?.breakMinutes, MAX_BREAK)) return saved;
  } catch {
    // Fall back to the defaults
  }
  return { focusMinutes: 25, breakMinutes: 5 };
}

function saveTimes(times) {
  try {
    localStorage.setItem(TIMES_KEY, JSON.stringify(times));
  } catch {
    // The choice just won't be remembered
  }
}

function Pomodoro() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        icon="⏱️"
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
  const ringColour = phase === 'BREAK' ? 'text-emerald-400' : paused ? 'text-amber-400' : 'text-primary-400';

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
    <div className="space-y-5 pb-20 md:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Pomodoro</h1>
          <p className="text-slate-400 text-sm md:text-base">
            {idle ? 'Pick your focus and break times, then press Start.' : 'Your break starts by itself when the focus time ends.'}
          </p>
        </div>
        <button
          onClick={pomodoro.toggleMute}
          aria-pressed={pomodoro.muted}
          aria-label={pomodoro.muted ? 'Turn sound on' : 'Mute sound'}
          title={pomodoro.muted ? 'Sound off' : 'Sound on'}
          className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xl"
        >
          {pomodoro.muted ? '🔕' : '🔔'}
        </button>
      </div>

      {pomodoro.error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm" role="alert">
          {pomodoro.error}
        </div>
      )}

      <div className="glass-panel rounded-3xl p-5 sm:p-8 md:p-12 flex flex-col items-center">
        {/* Countdown ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 288 288" aria-hidden="true">
            <circle cx="144" cy="144" r={RADIUS} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
            <circle
              cx="144" cy="144" r={RADIUS} stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
              strokeLinecap="round"
              className={`${ringColour} transition-[stroke-dashoffset] duration-300 ease-linear`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" role="timer" aria-live="off">
            <span className={`text-sm font-bold uppercase tracking-widest ${ringColour}`}>{label}</span>
            <span className="mt-1 text-5xl sm:text-6xl font-bold text-white tabular-nums">{clock}</span>
          </div>
        </div>

        {/* Controls sit right under the timer, so Start stays in view on small phones */}
        <div className="w-full max-w-md mt-6 grid grid-cols-2 gap-3">
          {idle && (
            <button
              onClick={() => pomodoro.start(times.focusMinutes, times.breakMinutes)}
              disabled={busy || !timer}
              className="col-span-2 btn btn-primary py-4 text-lg"
            >
              Start
            </button>
          )}
          {phase === 'FOCUS' && !paused && (
            <button onClick={pomodoro.pause} disabled={busy} className="btn btn-primary py-4 text-lg">Pause</button>
          )}
          {phase === 'FOCUS' && paused && (
            <button onClick={pomodoro.resume} disabled={busy} className="btn btn-primary py-4 text-lg">Resume</button>
          )}
          {phase === 'FOCUS' && (
            <button onClick={() => setConfirmReset(true)} disabled={busy} className="btn btn-outline py-4 text-lg">Reset</button>
          )}
          {phase === 'BREAK' && (
            <button onClick={pomodoro.skipBreak} disabled={busy} className="col-span-2 btn btn-outline py-4 text-lg">Skip break</button>
          )}
        </div>

        {/* Choosing times, only before starting; the timer above shows the choice */}
        {idle && timer && (
          <div className="w-full max-w-md mt-6 pt-5 border-t border-white/5 space-y-5">
            <DurationPicker
              label="Focus"
              value={times.focusMinutes}
              presets={FOCUS_PRESETS}
              max={MAX_FOCUS}
              onChange={(focusMinutes) => chooseTimes({ focusMinutes })}
            />
            <DurationPicker
              label="Break"
              value={times.breakMinutes}
              presets={BREAK_PRESETS}
              max={MAX_BREAK}
              onChange={(breakMinutes) => chooseTimes({ breakMinutes })}
            />
          </div>
        )}

        <p className="mt-5 text-xs text-slate-500 text-center">
          The timer keeps running if you leave this page or close the app.
        </p>
      </div>

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
