/**
 * What the app calls itself.
 *
 * It used to answer that question three different ways: the browser tab said "Attendance
 * In Hand", the domain said "momentum", and Home said "Your student apps". One name, in
 * one place, so the next person to add a page cannot invent a fourth.
 *
 * The name is Momentum because the app long ago stopped being only about attendance —
 * tasks, habits, focus, the timetable and the calendar are all equal parts of it now.
 */
export const APP_NAME = 'Momentum';

/** The badge on the sign-in card and in the sidebar */
export const APP_INITIAL = 'M';

export const APP_TAGLINE = 'Attendance, tasks, habits and focus in one place';

/** "Tasks · Momentum", or just "Momentum" on the home screen */
export const pageTitle = (page) => (page ? `${page} · ${APP_NAME}` : APP_NAME);
