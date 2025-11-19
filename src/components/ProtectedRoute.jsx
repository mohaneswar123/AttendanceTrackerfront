import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isUserActive, getLoggedUser } from '../utils/auth';
import { authService } from '../services/api';

function ProtectedRoute({ children }) {
  const [forceInactive, setForceInactive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let intervalId;

    const check = async () => {
      try {
        const local = getLoggedUser();
        const localId = local?.id || local?._id;

        // Guest → allow (skip)
        if (!localId) return;

        // Fetch fresh user
        const fresh = await authService.getUserById(localId);

        // If backend deleted user → remove & redirect
        if (!fresh) {
          localStorage.removeItem('loggedUser');
          if (!cancelled) setForceInactive(true);
          clearInterval(intervalId);
          return;
        }

        // Save updated user data
        localStorage.setItem('loggedUser', JSON.stringify(fresh));

        // Check active + paidTill
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const paid = fresh.paidTill ? new Date(fresh.paidTill) : null;
        const activeNow = fresh.active === true && paid && paid >= today;

        // ❌ USER IS INACTIVE — REMOVE FROM LOCALSTORAGE INSTANTLY
        if (!activeNow && !cancelled) {
          localStorage.removeItem('loggedUser');   // <--- IMPORTANT
          setForceInactive(true);
          clearInterval(intervalId);
        }

      } catch (err) {
        console.error("Background user check failed:", err);
      }
    };

    check();
    intervalId = setInterval(check, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const user = getLoggedUser();

  // Logged-in inactive user → go inactive
  if (forceInactive) {
    return <Navigate to="/inactive" replace />;
  }

  return children;
}

export default ProtectedRoute;
