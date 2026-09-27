import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { adminService, errorMessage } from '../services/api';
import AdminUserList from '../components/admin/AdminUserList';
import AdminUserDetail from '../components/admin/AdminUserDetail';
import AdminActivityLog from '../components/admin/AdminActivityLog';
import ConfirmDialog from '../components/ConfirmDialog';
import ThemeToggle from '../components/ThemeToggle';
import { LogOutIcon } from '../components/icons';
import { accessState } from '../utils/admin';

// Backend accounts come back with `id`; the portal uses `_id`
const normalizeUser = (user) => ({ ...user, _id: user._id || user.id, username: user.username || user.name });

function AdminDashboard() {
  const { logout } = useContext(AttendanceContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirming, setConfirming] = useState(null); // { title, message, confirmLabel, run }

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const loadUsers = useCallback(async () => {
    const list = (await adminService.getAllUsers()).map(normalizeUser);
    setUsers(list);
    return list;
  }, []);

  const loadActivity = useCallback(async () => {
    setActivity(await adminService.getActivity({ limit: 50 }));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadUsers(), loadActivity()]);
        setError('');
      } catch (err) {
        setError(errorMessage(err, 'Failed to load accounts'));
      } finally {
        setLoading(false);
      }
    })();
  }, [loadUsers, loadActivity]);

  // The chosen account's data
  useEffect(() => {
    if (!selectedId) {
      setSubjects([]);
      setAttendance([]);
      setHistory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [subjectList, records, entries] = await Promise.all([
          adminService.getUserSubjects(selectedId),
          adminService.getUserAttendance(selectedId),
          adminService.getActivity({ limit: 20, userId: selectedId })
        ]);
        if (cancelled) return;

        const normalizedSubjects = subjectList.map(s => ({ _id: s._id || s.id, name: s.name }));
        const byId = Object.fromEntries(normalizedSubjects.map(s => [s._id, s]));
        setSubjects(normalizedSubjects);
        setAttendance(records.map(record => {
          const subjectId = record.subject?._id || record.subject?.id
            || (typeof record.subject === 'string' ? record.subject : record.subjectId);
          return { ...record, _id: record._id || record.id, subjectId, subject: byId[subjectId] || null };
        }));
        setHistory(entries);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, 'Failed to load that account'));
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const selectedUser = users.find(user => user._id === selectedId) || null;

  const counts = useMemo(() => {
    const tally = { total: users.length, active: 0, expiring: 0, expired: 0, inactive: 0 };
    users.forEach(user => { tally[accessState(user)] += 1; });
    return tally;
  }, [users]);

  const visibleUsers = useMemo(() => {
    const text = query.trim().toLowerCase();
    return users.filter(user => {
      const state = accessState(user);
      if (filter === 'active' && state !== 'active') return false;
      if (filter === 'expiring' && state !== 'expiring' && state !== 'expired') return false;
      if (filter === 'inactive' && state !== 'inactive') return false;
      if (!text) return true;
      return user.username?.toLowerCase().includes(text) || user.email?.toLowerCase().includes(text);
    });
  }, [users, filter, query]);

  // Every admin action goes through here: run it, refresh, say what happened
  const act = async (run, success) => {
    setBusy(true);
    try {
      await run();
      await Promise.all([loadUsers(), loadActivity()]);
      if (selectedId) setHistory(await adminService.getActivity({ limit: 20, userId: selectedId }));
      setNotice(success);
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'That action failed'));
    } finally {
      setBusy(false);
    }
  };

  const confirmThen = (dialog) => setConfirming(dialog);

  const handleActivate = (days) => confirmThen({
    title: 'Set access from today?',
    message: `${selectedUser.username} will have ${days} ${days === 1 ? 'day' : 'days'} from today. Any days left over are replaced.`,
    confirmLabel: 'Set access',
    run: () => act(() => adminService.activateUser(selectedId, days), `${selectedUser.username} now has ${days} days from today.`)
  });

  const handleExtend = (days) => act(
    () => adminService.extendUser(selectedId, days),
    `Added ${days} ${days === 1 ? 'day' : 'days'} for ${selectedUser.username}.`
  );

  const handleDeactivate = () => confirmThen({
    title: 'Withdraw access?',
    message: `${selectedUser.username} loses access immediately. Their data is kept.`,
    confirmLabel: 'Deactivate',
    danger: true,
    run: () => act(() => adminService.deactivateUser(selectedId), `${selectedUser.username} was deactivated.`)
  });

  const handleSetPassword = (password, clear) => confirmThen({
    title: 'Set a new password?',
    message: `${selectedUser.username}'s current password stops working straight away. Send them the new one.`,
    confirmLabel: 'Set password',
    run: async () => {
      await act(() => adminService.setUserPassword(selectedId, password), `Password set. Send it to ${selectedUser.email}.`);
      clear();
    }
  });

  const handleDelete = () => confirmThen({
    title: 'Delete this account?',
    message: `${selectedUser.username} (${selectedUser.email}) and everything they own will be removed. This cannot be undone.`,
    confirmLabel: 'Delete account',
    danger: true,
    run: async () => {
      const name = selectedUser.username;
      await act(() => adminService.deleteUser(selectedId), `${name} was deleted.`);
      setSelectedId(null);
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const stat = (label, value, tone = 'text-white') => (
    <div className="surface px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 tabular-nums ${tone}`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 h-14 bg-background-paper border-b border-line">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-6 h-6 rounded bg-primary-600 text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0">AH</span>
            <span className="font-semibold tracking-tight text-white truncate">Admin</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle compact />
            <button onClick={handleLogout} aria-label="Sign out" className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <LogOutIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stat('Accounts', counts.total)}
          {stat('Active', counts.active, 'text-emerald-400')}
          {stat(`Expiring or expired`, counts.expiring + counts.expired, 'text-amber-400')}
          {stat('Inactive', counts.inactive, 'text-slate-400')}
        </div>

        {notice && <div className="notice notice-success" role="status">{notice}</div>}
        {error && (
          <div className="notice notice-danger" role="alert">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="font-medium underline underline-offset-2">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)] gap-4 items-start">
          <div className="lg:sticky lg:top-20 h-[28rem] lg:h-[calc(100vh-8rem)]">
            <AdminUserList
              users={visibleUsers}
              selectedId={selectedId}
              onSelect={setSelectedId}
              filter={filter}
              onFilterChange={setFilter}
              query={query}
              onQueryChange={setQuery}
              loading={loading}
            />
          </div>

          {selectedUser ? (
            <AdminUserDetail
              user={selectedUser}
              subjects={subjects}
              attendance={attendance}
              history={history}
              busy={busy}
              onActivate={handleActivate}
              onExtend={handleExtend}
              onDeactivate={handleDeactivate}
              onDelete={handleDelete}
              onSetPassword={handleSetPassword}
            />
          ) : (
            <div className="space-y-4">
              <div className="surface p-10 text-center">
                <h2 className="font-semibold text-white">Pick an account</h2>
                <p className="text-sm text-slate-400 mt-1">Its access, attendance and history appear here.</p>
              </div>
              <AdminActivityLog entries={activity} />
            </div>
          )}
        </div>
      </main>

      {confirming && (
        <ConfirmDialog
          title={confirming.title}
          message={confirming.message}
          confirmLabel={confirming.confirmLabel}
          danger={confirming.danger}
          onConfirm={() => {
            const { run } = confirming;
            setConfirming(null);
            run();
          }}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
