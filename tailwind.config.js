// Colours that differ between the dark and light sets are read from CSS variables
// (see src/theme.css), so switching data-theme on <html> re-paints everything.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
const ramp = (name, shades) => Object.fromEntries(shades.map(shade => [shade, v(`${name}-${shade}`)]));
// On a dark screen these shades are text; on cream they take the dark end of their palette
const TEXT_SHADES = [50, 100, 200, 300, 400];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Midnight Aurora by default, cream under data-theme="light"
        white: v('white'),
        // Surfaces and muted text in one ramp, so panels and labels flip together
        slate: ramp('slate', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        background: {
          DEFAULT: v('bg-base'),
          paper: v('bg-paper'),
          surface: v('bg-surface'),
        },
        primary: {
          DEFAULT: '#6366F1', // Indigo 500
          foreground: '#FFFFFF', // always white: it sits on a filled violet button
          ...ramp('primary', TEXT_SHADES),
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        secondary: {
          DEFAULT: '#0EA5E9', // Sky 500
          foreground: '#FFFFFF',
          50: '#ECFEFF',
          ...ramp('secondary', [100, 200, 300, 400]),
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        // Tailwind's own palettes, with only their light shades made theme-aware
        rose: ramp('rose', TEXT_SHADES),
        emerald: ramp('emerald', TEXT_SHADES),
        amber: ramp('amber', TEXT_SHADES),
        red: ramp('red', [100, 200, 300, 400]),
        indigo: ramp('indigo', TEXT_SHADES),
        sky: ramp('sky', TEXT_SHADES),
        cyan: ramp('cyan', TEXT_SHADES),
        violet: ramp('violet', TEXT_SHADES),
        teal: ramp('teal', TEXT_SHADES),
        orange: ramp('orange', TEXT_SHADES),
        blue: ramp('blue', [100, 200, 300, 400]),
        purple: ramp('purple', [100, 200, 300, 400]),
        accent: {
          DEFAULT: '#10B981', // Emerald 500
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#334155', // Slate 700
          foreground: v('ink-muted'),
        },
        border: v('line'),
        line: v('line'),
        // Names used by the older pages (About, Contact, legal pages, 404, Inactive, mobile header)
        dark: {
          primary: v('bg-base'),    // same as background
          secondary: v('bg-paper'), // same as background.paper
        },
        light: {
          primary: v('ink-base'),   // the body text colour
        },
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
        'md': '0 4px 12px -2px rgba(0, 0, 0, 0.18)',
        'lg': '0 10px 30px -10px rgba(0, 0, 0, 0.35)',
      },
      spacing: {
        // Room for the home indicator on notched phones (pb-safe-area)
        'safe-area': 'env(safe-area-inset-bottom)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out forwards',
        'slide-up': 'slideUp 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
