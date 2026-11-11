import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingIndicator from './components/LoadingIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import usePageTitle from './hooks/usePageTitle';
import { AttendanceContext, AttendanceProvider } from './contexts/AttendanceContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy-loaded page
const Attendance = lazy(() => import('./pages/Attendance'));
const Settings = lazy(() => import('./pages/Settings'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Pomodoro = lazy(() => import('./pages/Pomodoro'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Home = lazy(() => import('./pages/Home'));
const Habits = lazy(() => import('./pages/Habits'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const InactivePage = lazy(() => import('./pages/InactivePage'));

// No longer need ProtectedRoute - all pages are accessible without login
// Admin route still requires authentication
const AdminRoute = ({ children }) => {
  const { currentUser } = useContext(AttendanceContext);
  return currentUser?.isAdmin ? children : <Navigate to="/admin/login" replace />;
};

/** Keeps the browser tab named after the page; must sit inside the Router */
function PageTitle() {
  usePageTitle();
  return null;
}

function AppContent() {
  const { loading } = useContext(AttendanceContext);

  return (
    <>
      {loading && <LoadingIndicator />}
      <Router>
        <PageTitle />
        <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/inactive" element={<InactivePage />} />

            {/* Footer pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/terms" element={<Terms />} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            {/* Home is the first screen; each feature owns a path and its sections
                hang off it, so the bottom bar inside a feature can be built from them */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Home /></Layout>
              </ProtectedRoute>
            } />

            {[
              ['/attendance', Attendance], ['/attendance/history', Attendance],
              ['/attendance/reports', Attendance], ['/attendance/subjects', Attendance],
              ['/tasks', Tasks], ['/tasks/important', Tasks], ['/tasks/done', Tasks],
              ['/habits', Habits], ['/habits/all', Habits], ['/habits/progress', Habits],
              ['/calendar', Calendar], ['/calendar/week', Calendar], ['/calendar/events', Calendar],
              ['/timetable', Timetable], ['/timetable/schedules', Timetable],
              ['/focus', Pomodoro], ['/focus/settings', Pomodoro]
            ].map(([path, Page]) => (
              <Route key={path} path={path} element={
                <ProtectedRoute>
                  <Layout><Page /></Layout>
                </ProtectedRoute>
              } />
            ))}

            {/* Where the sections used to live, so old links and bookmarks still work */}
            {[
              ['/history', '/attendance/history'], ['/reports', '/attendance/reports'],
              ['/subjects', '/attendance/subjects'], ['/pomodoro', '/focus'],
              // The board is gone; its tasks are all in the list
              ['/tasks/board', '/tasks'], ['/tasks/upcoming', '/tasks'],
              // Sections that were taken out, pointing at the one that replaced them
              ['/calendar/day', '/calendar'], ['/timetable/week', '/timetable'],
              ['/focus/sessions', '/focus']
            ].map(([from, to]) => (
              <Route key={from} path={from} element={<Navigate to={to} replace />} />
            ))}

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />


            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AttendanceProvider>
        <AppContent />
      </AttendanceProvider>
    </ThemeProvider>
  );
}

export default App;
