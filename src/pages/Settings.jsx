import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import PageHeader from '../components/PageHeader';
import ThemeToggle from '../components/ThemeToggle';
import InstallApp from '../components/InstallApp';

// The account and this device. Subjects live with the attendance they belong to.
function Settings() {
  const { currentUser, resetAllData, updateEmail, changePassword } = useContext(AttendanceContext);
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
      <PageHeader eyebrow="Your account" title="Settings" />

      {message.text && (
        <div className={`notice ${message.type === 'error' ? 'notice-danger' : 'notice-success'}`} role="status">
          {message.text}
        </div>
      )}

      <section className="surface p-4 md:p-5 flex items-center gap-4">
        <div className="w-12 h-12 shrink-0 rounded-full bg-primary-600 text-primary-foreground grid place-items-center text-lg font-semibold">
          {currentUser ? currentUser.email[0].toUpperCase() : 'G'}
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-white truncate">{currentUser ? currentUser.username || 'Student account' : 'Guest'}</h2>
          <p className="text-sm text-slate-500 truncate">{currentUser ? currentUser.email : 'Signed out — nothing is saved'}</p>
          {!currentUser && <Link to="/login" className="text-sm font-semibold text-primary-400 hover:text-primary-300 mt-1 inline-block">Sign in</Link>}
        </div>
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
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="New email address"
                className="input flex-1"
              />
              <button onClick={() => handleUpdateProfile('email')} disabled={loading} className="btn btn-secondary shrink-0">Update</button>
            </div>
          </div>

          <div className="pt-5 border-t border-line space-y-2">
            <label htmlFor="settings-old-password" className="label">Password</label>
            <input
              id="settings-old-password"
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Current password"
              className="input"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                aria-label="New password"
                className="input"
              />
              <input
                type="password"
                value={confirmPasswordField}
                onChange={e => setConfirmPasswordField(e.target.value)}
                placeholder="Confirm"
                aria-label="Confirm new password"
                className="input"
              />
            </div>
            <button onClick={() => handleUpdateProfile('password')} disabled={loading} className="btn btn-secondary w-full mt-1">
              {loading ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </section>

        <section className="surface p-4 md:p-5">
          <h2 className="font-semibold text-rose-400">Reset attendance</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Deletes your subjects and every attendance record, and cannot be undone. Your tasks, calendar, timetable and focus history are not affected.
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
    </div>
  );
}

export default Settings;
