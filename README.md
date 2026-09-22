# Attendance In Hand (frontend)

Students record attendance per subject (Present, Absent or No Class, plus the class length in hours) and see their history and attendance percentage. Built with React 18, Vite, Tailwind CSS 3 and React Router, and installable as a PWA.

Live at https://attendanceinhand.netlify.app. The backend lives in the separate `AttendanceTrackerBackend-mongo` repository.

## Getting started

```
npm install
npm run dev
```

Then open http://localhost:5173.

By default the app talks to the deployed backend on Render. To use a backend running on your machine, copy `.env.example` to `.env.local` (it points at `http://localhost:8080/api`). The backend allows `http://localhost:5173` by default.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 5173 |
| `npm run build` | Production build in `dist/` |
| `npm run serve` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run generate-pwa-assets` | Regenerate the favicon and app icons in `public/` from `public/favicon.svg` |

## How it fits together

- `src/services/api.js`: every backend call. It sends the login token with each request. If the server rejects the token, the user is signed out. If the subscription has lapsed, the user is sent to `/inactive`.
- `src/contexts/AttendanceContext.jsx`: the signed-in session (stored in `localStorage` under `session`), subjects, attendance records and the actions that change them.
- `src/components/ProtectedRoute.jsx`: re-checks the subscription when a page opens, when the tab regains focus and every minute. Guests can browse the pages without saving anything.
- `src/pages/`: one component per route. The routes are listed in `src/App.jsx`.
- `tailwind.config.js` and `src/index.css`: the "Midnight Aurora" theme and the shared `glass-panel`, `glass-card`, `btn` and `input` classes.

Attendance percentages are weighted by class length: a 2-hour class counts twice as much as a 1-hour class, and "No Class" doesn't count.

## Deployment

Netlify builds with `npm run build` and publishes `dist/`. `public/_redirects` sends every path to `index.html` so client-side routes work on refresh.
