import { useCallback, useEffect, useRef, useState } from 'react';
import { pomodoroService, errorMessage } from '../services/api';

const MUTE_KEY = 'pomodoroMuted';

let audioContext = null;

// Browsers only allow sound once the student has interacted with the page, so the
// context is created on a click and reused for the chimes.
function getAudioContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext && AudioCtx) audioContext = new AudioCtx();
    if (audioContext?.state === 'suspended') audioContext.resume();
  } catch {
    audioContext = null;
  }
  return audioContext;
}

// Three rising notes
function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, i) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = start + i * 0.22;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(t);
    oscillator.stop(t + 0.4);
  });
}

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

// The student's Pomodoro timer. The server keeps the state; this counts down between
// updates and reports when a focus period ends.
export default function usePomodoro(enabled) {
  const [timer, setTimer] = useState(null);   // { phase, sessionId, remainingSeconds, totalSeconds, paused }
  const [endsAt, setEndsAt] = useState(null); // when the running phase ends, on this device's clock
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(readMuted);
  const finishing = useRef(false);
  const chimedFor = useRef(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  // Timing always starts from the server's remainingSeconds, so a wrong device clock doesn't matter
  const apply = useCallback((state) => {
    const receivedAt = Date.now();
    setTimer(state);
    setNow(receivedAt);
    setEndsAt(state.phase !== 'IDLE' && !state.paused ? receivedAt + state.remainingSeconds * 1000 : null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      apply(await pomodoroService.getCurrent());
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Could not load the timer'));
    }
  }, [apply]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [enabled, refresh]);

  // Any click on the page lets the chime play later
  useEffect(() => {
    window.addEventListener('pointerdown', getAudioContext, { once: true });
    return () => window.removeEventListener('pointerdown', getAudioContext);
  }, []);

  useEffect(() => {
    if (!endsAt) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [endsAt]);

  const remainingSeconds = !timer ? null
    : endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000))
      : timer.remainingSeconds;

  // The running focus or break reached zero: chime once, then ask the server what's next
  useEffect(() => {
    if (!timer || !endsAt || remainingSeconds > 0 || finishing.current) return;
    finishing.current = true;
    const phaseKey = `${timer.phase}:${timer.sessionId}`;
    if (chimedFor.current !== phaseKey && !mutedRef.current) playChime();
    chimedFor.current = phaseKey;

    const next = timer.phase === 'FOCUS'
      ? pomodoroService.complete(timer.sessionId) // safe if it was already completed
      : pomodoroService.getCurrent();
    next.then(apply)
      .catch(() => refresh())
      .finally(() => { finishing.current = false; });
  }, [timer, endsAt, remainingSeconds, apply, refresh]);

  const run = async (action) => {
    setBusy(true);
    try {
      apply(await action());
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Something went wrong. Please try again.'));
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const toggleMute = () => {
    setMuted(current => {
      const next = !current;
      try {
        localStorage.setItem(MUTE_KEY, next ? '1' : '0');
      } catch {
        // The setting just won't be remembered
      }
      return next;
    });
  };

  return {
    timer,
    remainingSeconds,
    busy,
    error,
    muted,
    toggleMute,
    start: (focusMinutes, breakMinutes) => run(() => pomodoroService.start(focusMinutes, breakMinutes)),
    pause: () => run(() => pomodoroService.pause(timer.sessionId)),
    resume: () => run(() => pomodoroService.resume(timer.sessionId)),
    reset: () => run(() => pomodoroService.stop(timer.sessionId)),
    skipBreak: () => run(() => pomodoroService.skipBreak(timer.sessionId))
  };
}
