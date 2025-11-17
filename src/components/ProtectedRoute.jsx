import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isUserActive, getLoggedUser } from '../utils/auth';
import { authService } from '../services/api';

function ProtectedRoute({ children }) {
  const [forceInactive, setForceInactive] = useState(false);

  // Background server check to catch admin deactivation without causing render loops
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const local = getLoggedUser();
        // Accept either _id or id from stored user
        const localId = local && (local._id || local.id);
        if (!local || !localId) return; // guest: synchronous guard will handle
        const fresh = await authService.getUserById(localId);
        if (fresh) {
          try { localStorage.setItem('loggedUser', JSON.stringify(fresh)); } catch {}
        }
        const today = new Date(); today.setHours(0,0,0,0);
        const paid = fresh?.paidTill ? new Date(fresh.paidTill) : null; if (paid) paid.setHours(0,0,0,0);
        const activeNow = !!(fresh && fresh.active === true && paid && paid.getTime() >= today.getTime());
        if (!activeNow && !cancelled) setForceInactive(true);
      } catch {}
    };
    check();
    const id = setInterval(check, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Synchronous gate to avoid loops
  const user = getLoggedUser();
  if (!user) return <Navigate to="/login" replace />;
  const active = isUserActive();
  if (!active || forceInactive) return <Navigate to="/inactive" replace />;
  return children;
}

export default ProtectedRoute;
