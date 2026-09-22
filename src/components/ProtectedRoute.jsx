import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

// Guests may browse these pages. For a signed-in student, the subscription is checked
// before the page shows, whenever the tab regains focus, and every minute; the API
// client redirects to /inactive once it has lapsed.
function ProtectedRoute({ children }) {
  const { currentUser, refreshUser } = useContext(AttendanceContext);
  const userId = currentUser && !currentUser.isAdmin ? currentUser._id : null;
  const [checked, setChecked] = useState(!userId);

  // BLOCK BACK BUTTON CACHE
  useEffect(() => {
    const block = () => window.history.pushState(null, "", window.location.href);
    block();
    window.addEventListener("popstate", block);
    return () => window.removeEventListener("popstate", block);
  }, []);

  useEffect(() => {
    if (!userId) {
      setChecked(true);
      return;
    }

    let cancelled = false;
    const check = () => refreshUser().finally(() => {
      if (!cancelled) setChecked(true);
    });

    check();
    const interval = setInterval(check, 60 * 1000);
    window.addEventListener('focus', check);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', check);
    };
  }, [userId, refreshUser]);

  // Admins have their own dashboard
  if (currentUser?.isAdmin) return <Navigate to="/admin/dashboard" replace />;

  // WAIT UNTIL INITIAL CHECK COMPLETES
  if (!checked) return null;

  return children;
}

export default ProtectedRoute;
