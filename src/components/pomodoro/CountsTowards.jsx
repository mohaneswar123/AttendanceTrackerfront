import React from 'react';

/**
 * Which habit a finished focus session counts towards.
 *
 * Only time-based habits due today can be chosen, since those are the only ones measured
 * in minutes. The choice is remembered on this device, and "Nothing" is a real option:
 * a session that is not revision should not quietly tick off a revision habit.
 */
function CountsTowards({ habits, value, onChange, lastCredited }) {
  if (habits.length === 0) return null;

  return (
    <section className="surface p-4" aria-label="What this session counts towards">
      <label htmlFor="counts-towards" className="label">Counts towards</label>
      <select
        id="counts-towards"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="input"
      >
        <option value="">Nothing</option>
        {habits.map(habit => (
          <option key={habit.id} value={habit.id}>
            {habit.name} · {habit.today?.amount ?? 0} of {habit.target} min
          </option>
        ))}
      </select>
      <p className="text-sm text-slate-400 mt-1.5">
        {lastCredited
          ? lastCredited
          : 'When a focus period finishes, its minutes are added to this habit.'}
      </p>
    </section>
  );
}

export default CountsTowards;
