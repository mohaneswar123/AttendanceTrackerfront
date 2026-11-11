import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import useDismiss from '../../hooks/useDismiss';
import { initialOf, SUBJECT_COLORS, SUBJECT_COLOR_NAMES, subjectTone, tally } from '../../utils/attendance';
import { PlusIcon } from '../icons';

/** The ⋯ on a subject: rename it, give it a colour, or take it out */
function SubjectMenu({ subject, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  const choose = (action) => () => {
    setOpen(false);
    action();
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={`More actions for ${subject.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-11 h-11 grid place-items-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/10"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-30 w-48 overlay py-1 text-base md:text-sm">
          <button role="menuitem" onClick={choose(onEdit)} className="w-full text-left px-4 py-3 md:px-3 md:py-2.5 text-slate-300 hover:bg-white/5">
            Rename or recolour
          </button>
          <button role="menuitem" onClick={choose(onDelete)} className="w-full text-left px-4 py-3 md:px-3 md:py-2.5 text-rose-400 hover:bg-rose-500/10">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

/** Renaming and recolouring in one sheet, because they are the same thought */
function SubjectForm({ subject, onSave, onClose }) {
  const [name, setName] = useState(subject.name);
  const [color, setColor] = useState(subject.color || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    setError('');
    const result = await onSave({ name: name.trim(), color });
    setSaving(false);
    if (result?.success) onClose();
    else setError(result?.message || 'Could not save that subject');
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit subject"
        className="w-full md:max-w-sm rounded-t-2xl md:rounded-2xl overlay p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 animate-slide-up md:animate-fade-in"
      >
        <h2 className="font-semibold text-white">Edit subject</h2>

        {error && <div className="notice notice-danger" role="alert">{error}</div>}

        <div>
          <label htmlFor="subject-name" className="label">Name</label>
          <input
            id="subject-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="input"
          />
        </div>

        <div>
          <span className="label">Colour</span>
          <div className="flex flex-wrap gap-2 mt-1" role="radiogroup" aria-label="Colour">
            {SUBJECT_COLOR_NAMES.map(key => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={color === key}
                aria-label={key.toLowerCase()}
                onClick={() => setColor(key)}
                className={`w-11 h-11 rounded-full grid place-items-center transition-transform ${color === key
                  ? 'ring-2 ring-offset-2 ring-offset-background-paper ring-attendance scale-105'
                  : ''}`}
              >
                <span className={`w-8 h-8 rounded-full ${SUBJECT_COLORS[key].dot}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !name.trim()}
            className="btn flex-1 bg-light-primary text-background hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The subjects attendance is recorded against.
 *
 * Deleting one asks for its name back, because its attendance goes with it: that is a
 * term's worth of records behind one tap, and nothing else in the app is that destructive.
 */
function SubjectManager({ autoFocus = false }) {
  const {
    currentUser, subjects, attendanceRecords, addSubject, updateSubject, removeSubject
  } = useContext(AttendanceContext);

  const [newSubject, setNewSubject] = useState('');
  const [editing, setEditing] = useState(null);
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

  // Each subject's own figures, so the row says what it is worth without opening Reports
  const figures = useMemo(() => {
    const out = {};
    (subjects || []).forEach(subject => {
      out[subject._id] = tally((attendanceRecords || []).filter(record => record.subjectId === subject._id));
    });
    return out;
  }, [subjects, attendanceRecords]);

  const handleAdd = async () => {
    if (!currentUser) return show('Sign in to add subjects.', 'error');
    const name = newSubject.trim();
    if (!name) return;
    // The colour that keeps the list looking varied, rather than always the first one
    const color = SUBJECT_COLOR_NAMES[(subjects?.length || 0) % SUBJECT_COLOR_NAMES.length];
    const result = await addSubject(name, color);
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
    show(result.success ? 'Subject removed.' : result.message, result.success ? 'success' : 'error');
  };

  const canDelete = confirmText.trim().toLowerCase() === (deleteTarget?.name || '').trim().toLowerCase();

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-slate-500 -mt-1">
        {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} this term
      </p>

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

      <div className="surface flex items-center gap-2 p-2">
        <input
          ref={inputRef}
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Add a subject, e.g. English"
          aria-label="New subject name"
          maxLength={40}
          className="flex-1 min-w-0 h-11 px-2 bg-transparent border-0 text-base md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newSubject.trim()}
          className="btn shrink-0 h-11 px-4 bg-light-primary text-background hover:opacity-90 disabled:opacity-40"
        >
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
        <ul className="space-y-2">
          {subjects.map(subject => {
            const tone = subjectTone(subject);
            const totals = figures[subject._id] || { percentage: null, counted: 0 };
            return (
              <li key={subject._id} className={`flex items-center gap-3 p-3 rounded-xl ${tone.tint}`}>
                <span className={`w-11 h-11 shrink-0 rounded-full grid place-items-center text-base font-bold ${tone.avatar}`} aria-hidden="true">
                  {initialOf(subject.name)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-white truncate">{subject.name}</span>
                  <span className="block text-xs text-slate-500">
                    {totals.percentage === null
                      ? 'Nothing counted yet'
                      : `${totals.percentage}% · ${totals.counted} hrs counted`}
                  </span>
                </span>
                <SubjectMenu
                  subject={subject}
                  onEdit={() => currentUser ? setEditing(subject) : show('Sign in to edit subjects.', 'error')}
                  onDelete={() => currentUser ? (setDeleteTarget(subject), setConfirmText('')) : show('Sign in to remove subjects.', 'error')}
                />
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-slate-500 text-center px-4">
        Rename or recolour a subject from its ••• menu. Removing one also removes the
        attendance recorded against it, so its hours leave your reports too.
      </p>

      {editing && (
        <SubjectForm
          subject={editing}
          onSave={(fields) => updateSubject(editing._id, fields)}
          onClose={() => setEditing(null)}
        />
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
            <h2 id="delete-subject-title" className="font-semibold text-white">Remove this subject?</h2>
            <p className="text-sm text-slate-400">
              Removing <span className="text-slate-200">{deleteTarget.name}</span> deletes the
              {' '}{(figures[deleteTarget._id]?.counted) || 0} hours recorded against it, and they
              leave your reports. Type its name to confirm.
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
              <button onClick={handleDelete} disabled={!canDelete} className="btn btn-danger">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectManager;
