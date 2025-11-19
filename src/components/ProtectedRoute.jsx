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

        // 👉 If guest user → allow page (no checks)
        if (!localId) return;

        // Fetch fresh user
        const fresh = await authService.getUserById(localId);

        if (!fresh) {
          localStorage.removeItem('loggedUser');
          if (!cancelled) setForceInactive(true);
          clearInterval(intervalId);
          return;
        }

        // Sync updated user
        localStorage.setItem('loggedUser', JSON.stringify(fresh));

        // Active + paid check
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const paid = fresh.paidTill ? new Date(fresh.paidTill) : null;
        const activeNow = fresh.active === true && paid && paid >= today;

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

  const user = getLoggedUser();

  // ❌ Only logged-in inactive users → go inactive
  // ✔ Guest user → allowed
  if (user && (!isUserActive() || forceInactive)) {
    return <Navigate to="/inactive" replace />;
  }

  return children;
}

export default ProtectedRoute;
