import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import PageHeader from '../components/PageHeader';
import PasswordField from '../components/PasswordField';
import ThemeToggle from '../components/ThemeToggle';
import InstallApp from '../components/InstallApp';
import { MIN_PASSWORD } from './Register';
import { LogOutIcon } from '../components/icons';

// The account and this device. Subjects live with the attendance they belong to.
function Settings() {
  const { currentUser, resetAllData, updateEmail, changePassword, logout } = useContext(AttendanceContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPasswordField, setConfirmPasswordField] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const showMessage = (text, type = 'success') => setMessage({ text, type });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReset = async () => {
    if (resetConfirmText.trim().toLowerCase() !== 'reset all') {
      showMessage('Please type "reset all" to confirm.', 'error');
      return;
    }
    const result = await resetAllData();
    setIsResetting(false);
    setResetConfirmText('');
    showMessage(result.success ? 'All data reset' : result.message, result.success ? 'success' : 'error');
  };

  const handleUpdateProfile = async (type) => {
    if (!currentUser) return showMessage('Guest mode active', 'error');
    setLoading(true);
    try {
      let res;
      if (type === 'email') {
        if (!newEmail.includes('@')) throw new Error('Invalid email');
        res = await updateEmail(newEmail);
      } else {
        if (!newPassword) throw new Error('Enter a new password');
        if (newPassword !== confirmPasswordField) throw new Error('Passwords do not match');
        res = await changePassword(oldPassword, newPassword);
      }

      if (res.success) {
        showMessage(res.message || 'Updated successfully');
        if (type === 'email') setNewEmail('');
        else { setOldPassword(''); setNewPassword(''); setConfirmPasswordField(''); }
      } else {
        showMessage(res.message || 'Update failed', 'error');
      }
    } catch (err) {
      showMessage(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Settings has no section bar of its own, so without this a phone had no way out
          but the browser's back gesture — which an installed PWA does not have at all. */}
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
        className="md:hidden h-11 -ml-2 px-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-200"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <PageHeader eyebrow="Your account" title="Settings" />

      {message.text && (
        <div className={`notice ${message.type === 'error' ? 'notice-danger' : 'notice-success'}`} role="status">
          {message.text}
        </div>
      )}

      <section className="surface p-4 md:p-5 flex flex-wrap items-center gap-4">
        <div className="w-12 h-12 shrink-0 rounded-full bg-primary-600 text-primary-foreground grid place-items-center text-lg font-semibold">
          {currentUser ? currentUser.email[0].toUpperCase() : 'G'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white truncate">{currentUser ? currentUser.username || 'Student account' : 'Guest'}</h2>
          <p className="text-sm text-slate-500 truncate">{currentUser ? currentUser.email : 'Signed out — nothing is saved'}</p>
        </div>
        {/* Sign out used to sit here, the first full-width button on the page. It is at the
            bottom now: it is not what anyone opens Settings to do, and it was a mis-tap
            away from the profile you had just come to read. */}
        {!currentUser && (
          <Link to="/login" className="btn btn-primary w-full sm:w-auto shrink-0">Sign in</Link>
        )}
      </section>

      <section className="surface p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Appearance</h2>
          <p className="text-sm text-slate-500 mt-0.5">Remembered on this device only.</p>
        </div>
        <ThemeToggle />
      </section>

      <InstallApp />

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <section className="surface p-4 md:p-5 space-y-5">
          <h2 className="font-semibold text-white">Sign-in details</h2>

          <div>
            <label htmlFor="settings-email" className="label">Email address</label>
            <div className="flex gap-2">
              <input
                id="settings-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="New email address"
                className="input flex-1"
              />
              <button onClick={() => handleUpdateProfile('email')} disabled={loading} className="btn btn-secondary shrink-0">Update</button>
            </div>
          </div>

          {/* Stacked, not side by side: two 151px boxes with only a placeholder between
              them is where a mistyped new password goes unnoticed. */}
          <div className="pt-5 border-t border-line space-y-3">
            <PasswordField
              id="settings-old-password"
              label="Current password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Current password"
            />
            <PasswordField
              id="settings-new-password"
              label="New password"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              hint={`At least ${MIN_PASSWORD} characters.`}
            />
            <PasswordField
              id="settings-confirm-password"
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmPasswordField}
              onChange={e => setConfirmPasswordField(e.target.value)}
              placeholder="Confirm new password"
            />
            <button onClick={() => handleUpdateProfile('password')} disabled={loading} className="btn btn-secondary w-full mt-1">
              {loading ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </section>

        <section className="surface p-4 md:p-5">
          <h2 className="font-semibold text-rose-400">Reset attendance</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Deletes your subjects and every attendance record, and cannot be undone. Your tasks, habits, calendar, timetable and focus history are not affected.
          </p>

          {isResetting ? (
            <div className="space-y-3">
              <input
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder='Type "reset all" to confirm'
                aria-label='Type "reset all" to confirm'
                className="input"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  disabled={resetConfirmText.trim().toLowerCase() !== 'reset all'}
                  className="btn btn-danger flex-1"
                >
                  Reset everything
                </button>
                <button onClick={() => { setIsResetting(false); setResetConfirmText(''); }} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => currentUser ? (setIsResetting(true), setResetConfirmText('')) : showMessage('Login required', 'error')}
              className="btn w-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              Reset all attendance data
            </button>
          )}
        </section>
      </div>

      {currentUser && (
        <section className="surface p-4 md:p-5">
          <button onClick={handleLogout} className="btn btn-secondary w-full">
            <LogOutIcon className="w-4 h-4" />
            Sign out
          </button>
        </section>
      )}
    </div>
  );
}

export default Settings;
