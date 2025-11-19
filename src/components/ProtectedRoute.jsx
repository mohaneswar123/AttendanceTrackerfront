import React, { useEffect, useState, useContext } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { getLoggedUser } from '../utils/auth';
import { authService } from '../services/api';

function ProtectedRoute({ children }) {
  const { logout } = useContext(AttendanceContext);
  const [initialized, setInitialized] = useState(false);

  // BLOCK BACK BUTTON CACHE
  useEffect(() => {
    const block = () => window.history.pushState(null, "", window.location.href);
    block();
    window.addEventListener("popstate", block);
    return () => window.removeEventListener("popstate", block);
  }, []);

  // MASTER CHECK FUNCTION (used for initial + 5-sec checks)
  const validateUser = async () => {
    const local = getLoggedUser();
    const localId = local?.id || local?._id;

    // Guest → always allowed
    if (!localId) return { status: "guest" };

    try {
      const fresh = await authService.getUserById(localId);

      // Backend removed user
      if (!fresh) {
        localStorage.removeItem("loggedUser");
        logout();
        return { status: "inactive" };
      }

      // Update local user
      localStorage.setItem("loggedUser", JSON.stringify(fresh));

      // Check active
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const paid = fresh.paidTill ? new Date(fresh.paidTill) : null;
      const activeNow = fresh.active === true && paid && paid >= today;

      if (!activeNow) {
        localStorage.removeItem("loggedUser");
        logout();
        return { status: "inactive" };
      }

      return { status: "active" };

    } catch (e) {
      console.error("Validation failed:", e);
      localStorage.removeItem("loggedUser");
      logout();
      return { status: "inactive" };
    }
  };

  // INITIAL CHECK before render
  useEffect(() => {
    validateUser().then(result => {
      if (result.status === "inactive") {
        window.location.replace("/inactive");
      } else {
        setInitialized(true);
      }
    });
  }, []);

  // BACKGROUND CHECK EVERY 5 SECONDS
  useEffect(() => {
    if (!initialized) return;

    const interval = setInterval(async () => {
      const result = await validateUser();
      if (result.status === "inactive") {
        window.location.replace("/inactive");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [initialized]);

  // WAIT UNTIL INITIAL CHECK COMPLETES
  if (!initialized) return null;

  return children;
}

export default ProtectedRoute;
