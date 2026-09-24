import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import { PlusIcon, TrashIcon } from '../icons';

// The subjects attendance is recorded against. Deleting one asks for its name, because
// its records go with it.
function SubjectManager({ autoFocus = false }) {
  const { currentUser, subjects, addSubject, removeSubject } = useContext(AttendanceContext);
  const [newSubject, setNewSubject] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const show = (text, type = 'success') => setMessage({ text, type });

  const handleAdd = async () => {
    if (!currentUser) return show('Sign in to add subjects.', 'error');
    if (!newSubject.trim()) return;
    if (subjects.some(s => s.name?.toLowerCase() === newSubject.trim().toLowerCase())) {
      return show('You already have a subject with that name.', 'error');
    }
    const result = await addSubject(newSubject.trim());
    if (result.success) {
      setNewSubject('');
      show('Subject added.');
    } else {
      show(result.message, 'error');
    }
  };

  const handleDelete = async () => {
    const result = await removeSubject(deleteTarget._id);
    setDeleteTarget(null);
    setConfirmText('');
    show(result.success ? 'Subject deleted.' : result.message, result.success ? 'success' : 'error');
  };

  const canDelete = confirmText.trim().toLowerCase() === (deleteTarget?.name || '').trim().toLowerCase();

  return (
    <div className="max-w-2xl space-y-4">
      {!currentUser && (
        <div className="notice notice-warning">
          <span className="flex-1">You are not signed in, so subjects cannot be saved.</span>
          <Link to="/login" className="font-medium underline underline-offset-2">Sign in</Link>
        </div>
      )}

      {message.text && (
        <div className={`notice ${message.type === 'error' ? 'notice-danger' : 'notice-success'}`} role="status">
          {message.text}
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="e.g. Mathematics"
          aria-label="New subject name"
          className="input"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="btn btn-primary shrink-0 px-4">
          <PlusIcon className="w-4 h-4" />
          Add
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="surface p-10 text-center">
          <h2 className="font-semibold text-white">No subjects yet</h2>
          <p className="text-sm text-slate-400 mt-1">Add the classes you want to track.</p>
        </div>
      ) : (
        <ul className="surface divide-y divide-line">
          {subjects.map(sub => (
            <li key={sub._id} className="flex items-center gap-3 px-4 h-12">
              <span className="flex-1 min-w-0 text-sm text-slate-100 truncate">{sub.name}</span>
              <button
                onClick={() => currentUser ? (setDeleteTarget(sub), setConfirmText('')) : show('Sign in to delete subjects.', 'error')}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                aria-label={`Delete ${sub.name}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center justify-center md:p-4" onMouseDown={() => setDeleteTarget(null)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-subject-title"
            onMouseDown={(e) => e.stopPropagation()}
            className="overlay w-full md:max-w-sm rounded-b-none md:rounded-xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 animate-slide-up md:animate-fade-in"
          >
            <h2 id="delete-subject-title" className="font-semibold text-white">Delete this subject?</h2>
            <p className="text-sm text-slate-400">
              Deleting <span className="text-slate-200">{deleteTarget.name}</span> removes its attendance records too.
              Type its name to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteTarget.name}
              aria-label="Type the subject name to confirm"
              className="input"
            />
            <div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
              <button onClick={() => { setDeleteTarget(null); setConfirmText(''); }} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDelete} disabled={!canDelete} className="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectManager;
