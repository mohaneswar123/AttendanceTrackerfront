import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingIndicator from './components/LoadingIndicator';
import { AttendanceContext, AttendanceProvider } from './contexts/AttendanceContext';

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));
const Report = lazy(() => import('./pages/Report'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

// No longer need ProtectedRoute - all pages are accessible without login
// Admin route still requires authentication
const AdminRoute = ({ children }) => {
  const { currentUser } = useContext(AttendanceContext);
  return currentUser?.isAdmin ? children : <Navigate to="/admin/login" replace />;
};

function AppContent() {
  const { loading } = useContext(AttendanceContext);

  return (
    <>
      {loading && <LoadingIndicator />}
      <Router>
        <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />

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

            {/* User routes - now accessible without login */}
            <Route path="/" element={
              <Layout><Dashboard /></Layout>
            } />
            <Route path="/history" element={
              <Layout><History /></Layout>
            } />
            <Route path="/settings" element={
              <Layout><Settings /></Layout>
            } />
            <Route path="/reports" element={
              <Layout><Report /></Layout>
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
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}

export default App;
