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
        if (!localId) return;

        const fresh = await authService.getUserById(localId);

        // If backend deleted user → log them out
        if (!fresh) {
          localStorage.removeItem('loggedUser');
          if (!cancelled) setForceInactive(true);
          clearInterval(intervalId);
          return;
        }

        // Update local user
        localStorage.setItem('loggedUser', JSON.stringify(fresh));

        // Validate active + paidTill
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const paid = fresh.paidTill ? new Date(fresh.paidTill) : null;

        const activeNow = fresh.active === true && paid && paid >= today;

        // Force inactive if status changed
        if (!activeNow && !cancelled) {
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

  // Synchronous check
  const user = getLoggedUser();
  if (!user) return <Navigate to="/login" replace />;

  const active = isUserActive();
  if (!active || forceInactive) return <Navigate to="/inactive" replace />;

  return children;
}

export default ProtectedRoute;
