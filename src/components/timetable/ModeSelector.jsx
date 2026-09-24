import React, { useEffect, useRef, useState } from 'react';
import { MODE_COLORS } from '../../utils/timetable';

// Taller on phones so each option is easy to tap
const MENU_ITEM = 'w-full text-left px-4 py-3 md:px-3 md:py-2 active:bg-white/10';

// Closes the popup on Escape or a press outside it
function useDismiss(open, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
      document.removeEventListener('keydown', handle);
    };
  }, [open, close]);
  return ref;
}

const tile = (mode, size) => {
  const colors = MODE_COLORS[mode.color] || MODE_COLORS.VIOLET;
  return <span className={`${size} shrink-0 rounded-xl border flex items-center justify-center ${colors.soft}`} aria-hidden="true">{mode.icon}</span>;
};

const stateBadge = (mode) => (mode.active
  ? <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">Active</span>
  : <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Inactive</span>);

function ModeMenu({ mode, onSetActive, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  const choose = (action) => () => {
    setOpen(false);
    action();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={`More actions for ${mode.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-3 md:p-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-30 w-52 md:w-44 rounded-xl bg-slate-900 border border-white/10 shadow-2xl py-1 text-base md:text-sm">
          {!mode.active && (
            <button role="menuitem" onClick={choose(onSetActive)} className={`${MENU_ITEM} text-slate-300 hover:bg-white/5`}>Set as active</button>
          )}
          <button role="menuitem" onClick={choose(onEdit)} className={`${MENU_ITEM} text-slate-300 hover:bg-white/5`}>Edit</button>
          <button role="menuitem" onClick={choose(onDelete)} className={`${MENU_ITEM} text-rose-400 hover:bg-rose-500/10`}>Delete</button>
        </div>
      )}
    </div>
  );
}

// The mode being looked at, as a small dropdown, with its actions beside it
function ModeSelector({ modes, selectedModeId, onSelect, onSetActive, onEdit, onDelete, onCreate }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const selected = modes.find(mode => mode.id === selectedModeId) || modes[0];
  if (!selected) return null;

  const choose = (modeId) => () => {
    setOpen(false);
    onSelect(modeId);
  };

  return (
    <section aria-label="Timetable modes" className="flex items-center gap-2">
      <div className="relative min-w-0 max-w-[16rem]" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={`Mode: ${selected.name}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-white/5 transition-colors text-left"
        >
          {tile(selected, 'w-9 h-9 text-lg')}
          <span className="min-w-0">
            <span className="block font-semibold text-white truncate">{selected.name}</span>
            <span className="flex items-center gap-2">
              {stateBadge(selected)}
              <span className="text-[11px] text-slate-500">· {selected.activityCount} {selected.activityCount === 1 ? 'activity' : 'activities'}</span>
            </span>
          </span>
          <svg className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-900 border border-white/10 shadow-2xl py-1">
            <div role="listbox" aria-label="Switch mode" className="max-h-72 overflow-y-auto">
              {modes.map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  role="option"
                  aria-selected={mode.id === selected.id}
                  aria-label={`${mode.name}, ${mode.active ? 'active' : 'not active'}`}
                  onClick={choose(mode.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5 active:bg-white/10 ${mode.id === selected.id ? 'bg-white/5' : ''}`}
                >
                  {tile(mode, 'w-8 h-8 text-base')}
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-white truncate">{mode.name}</span>
                    <span className="block text-[11px] text-slate-500">
                      {mode.activityCount} {mode.activityCount === 1 ? 'activity' : 'activities'}
                    </span>
                  </span>
                  {mode.active && <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-300 shrink-0">Active</span>}
                </button>
              ))}
            </div>
            <div className="my-1 border-t border-white/5" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreate();
              }}
              className="w-full text-left px-3 py-3 md:py-2.5 text-sm font-semibold text-primary-300 hover:bg-white/5 active:bg-white/10"
            >
              + New mode
            </button>
          </div>
        )}
      </div>

      <ModeMenu
        mode={selected}
        onSetActive={() => onSetActive(selected)}
        onEdit={() => onEdit(selected)}
        onDelete={() => onDelete(selected)}
      />
    </section>
  );
}

export default ModeSelector;
