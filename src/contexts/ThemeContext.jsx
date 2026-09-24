import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';
export const THEMES = ['dark', 'light'];

// The colour set in use. It is remembered on this device only; there is nothing to sync.
export const ThemeContext = createContext({ theme: 'dark', setTheme: () => {}, toggleTheme: () => {} });

const readSaved = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(saved) ? saved : null;
  } catch {
    return null;
  }
};

// Dark is the default; a saved choice wins. index.html applies the same rule before the
// first paint, so the page never flashes the wrong colours.
export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#FAF6EF' : '#020617');
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readSaved() || 'dark');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return;
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A device that refuses storage still switches; it just won't be remembered.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readSaved() === 'light' || document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
