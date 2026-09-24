import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
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
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Your account and this device.</p>
      </div>

      {message.text && (
        <div className={`p-3 rounded-xl border text-sm ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`} role="status">
          {message.text}
        </div>
      )}

      <div className="surface p-6 rounded-xl flex items-center gap-5">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl font-bold text-primary-foreground">
          {currentUser ? currentUser.email[0].toUpperCase() : 'G'}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white">{currentUser ? 'Student Account' : 'Guest User'}</h2>
          <p className="text-slate-400 text-sm truncate">{currentUser ? currentUser.email : 'Local usage only'}</p>
          {!currentUser && <Link to="/login" className="text-primary-400 text-xs font-bold uppercase mt-2 block tracking-wider">Login to Sync</Link>}
        </div>
      </div>

      <div className="surface p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Appearance</h2>
          <p className="text-slate-400 text-sm mt-1">Remembered on this device only.</p>
        </div>
        <ThemeToggle />
      </div>

      <InstallApp />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="surface p-6 rounded-xl space-y-5">
          <h2 className="text-lg font-bold text-white">Security</h2>

          <div className="space-y-2">
            <label htmlFor="settings-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Update Email</label>
            <div className="flex gap-2">
              <input
                id="settings-email"
                value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email address"
                className="flex-1 bg-slate-900/50 border border-line rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
              />
              <button onClick={() => handleUpdateProfile('email')} disabled={loading} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors">Update</button>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-line">
            <label htmlFor="settings-old-password" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Change Password</label>
            <input id="settings-old-password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Current password"
              className="w-full bg-slate-900/50 border border-line rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" aria-label="New password"
                className="bg-slate-900/50 border border-line rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none" />
              <input type="password" value={confirmPasswordField} onChange={e => setConfirmPasswordField(e.target.value)} placeholder="Confirm" aria-label="Confirm new password"
                className="bg-slate-900/50 border border-line rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none" />
            </div>
            <button onClick={() => handleUpdateProfile('password')} disabled={loading} className="w-full py-2.5 mt-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors">
              {loading ? 'Processing...' : 'Change Password'}
            </button>
          </div>
        </div>

        <div className="surface p-6 rounded-xl border border-rose-500/20">
          <h2 className="text-lg font-bold text-rose-400 mb-2">Danger Zone</h2>
          <p className="text-slate-400 text-sm mb-4">
            Irreversible. Deletes your subjects and attendance records. Your tasks, calendar, timetable and focus history are not affected.
          </p>

          {isResetting ? (
            <div className="space-y-3">
              <input
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder='Type "reset all" to confirm'
                aria-label='Type "reset all" to confirm'
                className="w-full bg-slate-900/50 border border-line rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:border-rose-500 outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  disabled={resetConfirmText.trim().toLowerCase() !== 'reset all'}
                  className="flex-1 py-2.5 bg-rose-600 text-primary-foreground rounded-xl font-semibold text-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset everything
                </button>
                <button onClick={() => { setIsResetting(false); setResetConfirmText(''); }} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => currentUser ? (setIsResetting(true), setResetConfirmText('')) : showMessage('Login required', 'error')}
              className="w-full py-2.5 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-500/10 transition-colors"
            >
              Reset all attendance data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
