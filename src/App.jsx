import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingIndicator from './components/LoadingIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import { AttendanceContext, AttendanceProvider } from './contexts/AttendanceContext';

// Lazy-loaded page
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
const InactivePage = lazy(() => import('./pages/InactivePage'));

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

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/history" element={
              <ProtectedRoute>
                <Layout><History /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout><Report /></Layout>
              </ProtectedRoute>
            } />

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
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}

export default App;
