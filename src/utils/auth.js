// Simple auth utilities for subscription validation
// Reads "loggedUser" from localStorage and validates active + paidTill >= today

export function getLoggedUser() {
  try {
    const raw = localStorage.getItem('loggedUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isUserActive() {
  const user = getLoggedUser();
  if (!user) return false;

  // active flag must be true
  if (!user.active) return false;

  // paidTill must be today or a future date
  if (!user.paidTill) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const paid = new Date(user.paidTill);
  paid.setHours(0, 0, 0, 0);

  return paid.getTime() >= today.getTime();
}
