import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

function Settings() {
  const { currentUser, subjects, addSubject, removeSubject, resetAllData, updateEmail, changePassword } = useContext(AttendanceContext);
  const [newSubject, setNewSubject] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [confirmText, setConfirmText] = useState('');
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Password / Email states
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPasswordField, setConfirmPasswordField] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to show messages
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleAddSubject = () => {
    if (!currentUser) return showMessage('Guest mode active', 'error');
    if (!newSubject.trim()) return;

    if (subjects.some(s => s.name?.toLowerCase() === newSubject.trim().toLowerCase())) {
      return showMessage('Subject already exists', 'error');
    }
    addSubject(newSubject.trim());
    setNewSubject('');
    showMessage('Subject added');
  };

  const handleUpdateProfile = async (type) => {
    if (!currentUser) return showMessage('Guest mode active', 'error');
    setLoading(true);
    try {
      let res;
      if (type === 'email') {
        if (!newEmail.includes('@')) throw new Error('Invalid email');
        res = await updateEmail(currentUser._id, newEmail);
      } else {
        if (newPassword !== confirmPasswordField) throw new Error('Passwords do not match');
        res = await changePassword(currentUser.email, oldPassword, newPassword);
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
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400">Manage your subjects and account preferences.</p>
      </div>

      {/* Global Message Toast */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-slide-in ${message.type === 'error' ? 'bg-rose-500/20 border-rose-500/50 text-rose-200' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
          }`}>
          {message.type === 'error' ? '⚠️' : '✅'} {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="glass-panel p-6 rounded-3xl flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary-500/30">
          {currentUser ? currentUser.email[0].toUpperCase() : 'G'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{currentUser ? 'Student Account' : 'Guest User'}</h2>
          <p className="text-slate-400 text-sm">{currentUser ? currentUser.email : 'Local usage only'}</p>
          {!currentUser && <Link to="/login" className="text-primary-400 text-xs font-bold uppercase mt-2 block tracking-wider">Login to Sync</Link>}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Subject Management */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">📚</span>
            Subjects
          </h3>

          <div className="flex gap-2">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter subject name (e.g. Mathematics)"
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-all placeholder:text-slate-600"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
            />
            <button
              onClick={handleAddSubject}
              className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
            {subjects.length === 0 && <p className="text-slate-500 text-sm italic w-full text-center py-4">No subjects added yet.</p>}
            {subjects.map(sub => (
              <div key={sub._id} className="group flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                <span className="text-slate-200 font-medium">{sub.name}</span>
                {confirmDelete === sub._id ? (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type subject name to confirm"
                      className="bg-slate-900/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-slate-500"
                    />
                    <button
                      onClick={() => {
                        const typed = (confirmText || '').trim().toLowerCase();
                        const expected = (sub.name || '').trim().toLowerCase();
                        if (typed !== expected) {
                          showMessage(`Type "${sub.name}" to confirm`, 'error');
                          return;
                        }
                        removeSubject(sub._id);
                        setConfirmDelete(null);
                        setConfirmText('');
                        showMessage('Subject deleted');
                      }}
                      className="text-rose-400 hover:text-rose-300 font-bold text-xs"
                    >
                      Delete
                    </button>
                    <button onClick={() => { setConfirmDelete(null); setConfirmText(''); }} className="text-slate-500 hover:text-slate-400">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => currentUser ? setConfirmDelete(sub._id) : showMessage('Login required', 'error')}
                    className="text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security & Danger Zone */}
        <div className="space-y-6">

          {/* Account Security */}
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">🔐</span>
              Security
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Update Email</label>
                <div className="flex gap-2">
                  <input
                    value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New Email Address"
                    className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                  <button onClick={() => handleUpdateProfile('email')} disabled={loading} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors">Update</button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Change Password</label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Current Password"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password"
                    className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none" />
                  <input type="password" value={confirmPasswordField} onChange={e => setConfirmPasswordField(e.target.value)} placeholder="Confirm"
                    className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none" />
                </div>
                <button onClick={() => handleUpdateProfile('password')} disabled={loading} className="w-full py-2 mt-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium transition-colors">
                  {loading ? 'Processing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Area */}
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5">
            <h3 className="text-lg font-bold text-rose-400 mb-2">Danger Zone</h3>
            <p className="text-slate-400 text-sm mb-4">Irreversible action. All attendance data will be wiped.</p>

            {isResetting ? (
              <div className="space-y-3 animate-fade-in">
                <input
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder='Type "reset all" to confirm'
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder:text-slate-600 focus:border-rose-500 outline-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (resetConfirmText.trim().toLowerCase() !== 'reset all') {
                        showMessage('Please type "reset all" to confirm.', 'error');
                        return;
                      }
                      resetAllData();
                      setIsResetting(false);
                      setResetConfirmText('');
                      showMessage('All data reset');
                    }}
                    disabled={resetConfirmText.trim().toLowerCase() !== 'reset all'}
                    className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-900/50 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Wipe
                  </button>
                  <button onClick={() => { setIsResetting(false); setResetConfirmText(''); }} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => currentUser ? (setIsResetting(true), setResetConfirmText('')) : showMessage('Login required', 'error')} className="w-full py-2 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-500/10 transition-colors">
                Reset All Data
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Settings;
