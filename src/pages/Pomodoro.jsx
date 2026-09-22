import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import usePomodoro from '../hooks/usePomodoro';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatClock = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

function Pomodoro() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        icon="⏱️"
        title="Focus with Pomodoro"
        message="Log in to use the 25-minute focus timer with short breaks."
      />
    );
  }
  return <PomodoroTimer />;
}

function PomodoroTimer() {
  const pomodoro = usePomodoro(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const cancelReset = useCallback(() => setConfirmReset(false), []);
  const originalTitle = useRef(document.title);

  const { timer, remainingSeconds, busy } = pomodoro;
  const phase = timer?.phase ?? 'IDLE';
  const paused = phase === 'FOCUS' && timer.paused;
  const clock = remainingSeconds == null ? '--:--' : formatClock(remainingSeconds);
  const label = !timer ? 'Loading'
    : phase === 'BREAK' ? 'Break'
      : phase === 'FOCUS' ? (paused ? 'Paused' : 'Focus')
        : 'Ready to focus';

  const fraction = timer && timer.totalSeconds > 0 && remainingSeconds != null
    ? Math.min(1, remainingSeconds / timer.totalSeconds)
    : 1;
  const ringColour = phase === 'BREAK' ? 'text-emerald-400' : paused ? 'text-amber-400' : 'text-primary-400';

  // Show the countdown in the tab while this page is open
  useEffect(() => {
    document.title = phase === 'IDLE' ? originalTitle.current : `${clock} · ${label}`;
  }, [phase, clock, label]);
  useEffect(() => {
    const title = originalTitle.current;
    return () => { document.title = title; };
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Pomodoro</h1>
          <p className="text-slate-400">Focus for 25 minutes, then take a 5-minute break.</p>
        </div>
        <button
          onClick={pomodoro.toggleMute}
          aria-pressed={pomodoro.muted}
          aria-label={pomodoro.muted ? 'Turn sound on' : 'Mute sound'}
          title={pomodoro.muted ? 'Sound off' : 'Sound on'}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xl leading-none"
        >
          {pomodoro.muted ? '🔕' : '🔔'}
        </button>
      </div>

      {pomodoro.error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm" role="alert">
          {pomodoro.error}
        </div>
      )}

      <div className="glass-panel rounded-3xl p-8 md:p-12 flex flex-col items-center">
        {/* Countdown ring */}
        <div className="relative w-72 h-72 max-w-full">
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
            <span className="mt-1 text-6xl font-bold text-white tabular-nums">{clock}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {phase === 'IDLE' && (
            <button onClick={pomodoro.start} disabled={busy || !timer} className="btn btn-primary px-10 py-3 text-lg">
              Start
            </button>
          )}
          {phase === 'FOCUS' && !paused && (
            <button onClick={pomodoro.pause} disabled={busy} className="btn btn-primary px-8 py-3">Pause</button>
          )}
          {phase === 'FOCUS' && paused && (
            <button onClick={pomodoro.resume} disabled={busy} className="btn btn-primary px-8 py-3">Resume</button>
          )}
          {phase === 'FOCUS' && (
            <button onClick={() => setConfirmReset(true)} disabled={busy} className="btn btn-outline px-8 py-3">Reset</button>
          )}
          {phase === 'BREAK' && (
            <button onClick={pomodoro.skipBreak} disabled={busy} className="btn btn-outline px-8 py-3">Skip break</button>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center">
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
