import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MoonIcon, SunIcon } from './icons';

// Switches between the dark and light colour sets. `compact` is the icon on its own,
// for the sidebar and the phone header.
function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const toLight = theme === 'dark';

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={toLight ? 'Switch to light mode' : 'Switch to dark mode'}
        title={toLight ? 'Light mode' : 'Dark mode'}
        className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        {toLight ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  return (
    <div className="segmented" role="radiogroup" aria-label="Appearance">
      {[
        { value: 'dark', label: 'Dark', Icon: MoonIcon },
        { value: 'light', label: 'Light', Icon: SunIcon }
      ].map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => theme !== value && toggleTheme()}
          className="segmented-item inline-flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

export default ThemeToggle;
