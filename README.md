# Attendance In Hand (frontend)

Students record attendance per subject (Present, Absent or No Class, plus the class length in hours) and see their history and attendance percentage. They can also plan tasks on a simple Kanban board, keep a calendar, build weekly routines and focus with a Pomodoro timer. Built with React 18, Vite, Tailwind CSS 3, React Router and dnd-kit, and installable as a PWA.

Live at https://momentum-six-ivory.vercel.app. The backend lives in the separate `AttendanceTrackerBackend-mongo` repository.

## Getting started

```
npm install
npm run dev
```

Then open http://localhost:5173.

`npm run dev` talks to a backend running on your machine at `http://localhost:8080/api`, which allows `http://localhost:5173` by default. Production builds (`npm run build`) talk to the deployed backend on Render. To use a different backend, copy `.env.example` to `.env.local` and change `VITE_API_BASE_URL`.

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
- **Tasks** (`src/pages/Tasks.jsx`):
  - `src/hooks/useTaskBoard.js` loads the tasks for the chosen date filter. Moves happen on screen straight away and are then saved.
  - `src/components/tasks/` has the board, columns, cards, quick-add form and edit dialog.
  - Filters: Today, Yesterday, Upcoming, or a picked date.
  - Desktop shows three columns. Phones show one column at a time with a switcher and a floating + button. Cards move between columns by dragging on desktop, or with the card menu's "Move to".
- **Calendar** (`src/pages/Calendar.jsx`):
  - Month, Week and Day views (weeks start on Sunday), with Today and previous/next.
  - Add, edit and delete Events and Reminders, all-day or timed. A Reminder is just a calendar entry; nothing is sent.
  - An Upcoming list and title search.
  - `src/hooks/useCalendar.js` loads the dates on screen. `src/utils/calendarDate.js` handles the date maths on local "YYYY-MM-DD" strings, so days never shift.
  - Times are shown exactly as the server returns them, in the calendar's time zone.
  - On phones, the month shows dots and the chosen day's list, Week becomes a day-by-day list, and forms open as bottom sheets.
- **Timetable** (`src/pages/Timetable.jsx`):
  - Weekly routines grouped into modes (College, Home, Exam Prep …), each with its own Monday–Sunday plan. One mode is active.
  - A dropdown switches between modes; the ⋯ beside it offers Set as active, Edit mode, Copy a day and Delete mode.
  - Chips for the seven days, then the day itself: each activity's start time down the left and the activity as a card coloured by its category. Only the activities the student created are listed; empty stretches are simply empty.
  - Add, edit and delete activities from each card's ⋯ menu, and copy a day onto other days (which replaces them, after a warning).
  - Deleting a mode always asks first and says its activities go with it.
  - `src/hooks/useTimetable.js` holds the modes and the chosen mode's week. `src/utils/timetable.js` has the days, categories, colours, duration text and the overlap check.
  - The form refuses an overlapping activity before sending, but the server is the authority: it refuses the same clash with 409 even when the form is bypassed.
- **Pomodoro** (`src/pages/Pomodoro.jsx`):
  - Students pick their focus length (15, 25, 45, 60 or any 1–120 minutes) and break length (5, 10, 15 or any 1–30 minutes). The choice is remembered on the device.
  - `src/hooks/usePomodoro.js` keeps the display in step with the timer on the server, so it survives refreshes and leaving the page.
  - It isn't linked to tasks.
- `src/theme.css`, `tailwind.config.js` and `src/index.css`: the two colour sets and the shared `surface`, `btn`, `input`, `badge`, `notice` and `segmented` classes. `src/contexts/ThemeContext.jsx` switches between them.

Attendance percentages are weighted by class length: a 2-hour class counts twice as much as a 1-hour class, and "No Class" doesn't count.

## Deployment

Vercel builds with `npm run build` and publishes `dist/`.

`vercel.json` rewrites every path to `index.html`, so a client-side route still works when it is opened directly or refreshed. Vercel checks the filesystem first, so `/assets`, `/manifest.webmanifest` and `/sw.js` still serve themselves. Without that rewrite every route except `/` returns 404. It also stops `sw.js` being cached, or an old service worker would pin an old copy of the app.

`public/_redirects` does the same job on Netlify and is kept for that deployment.

**The backend has to allow the frontend's origin.** `CORS_ALLOWED_ORIGINS` on the API lists the sites that may call it. A site that is not on the list gets a network error at sign-in — the browser blocks the request before the server can explain, so the app can only say "Cannot reach the server".
