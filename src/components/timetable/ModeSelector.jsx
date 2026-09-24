import React, { useState } from 'react';
import useDismiss from '../../hooks/useDismiss';

// Taller on phones so each option is easy to tap
const MENU_ITEM = 'w-full text-left px-4 py-3 md:px-3 md:py-2.5 active:bg-white/10';

function ModeMenu({ mode, onSetActive, onEdit, onCopyDay, onDelete }) {
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
        className="p-3 md:p-2.5 rounded-lg border border-line bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-30 w-52 md:w-48 rounded-xl bg-slate-900 border border-line shadow-lg py-1 text-base md:text-sm">
          {!mode.active && (
            <button role="menuitem" onClick={choose(onSetActive)} className={`${MENU_ITEM} text-slate-300 hover:bg-white/5`}>Set as active</button>
          )}
          <button role="menuitem" onClick={choose(onEdit)} className={`${MENU_ITEM} text-slate-300 hover:bg-white/5`}>Edit mode</button>
          <button role="menuitem" onClick={choose(onCopyDay)} className={`${MENU_ITEM} text-slate-300 hover:bg-white/5`}>Copy a day</button>
          <button role="menuitem" onClick={choose(onDelete)} className={`${MENU_ITEM} text-rose-400 hover:bg-rose-500/10`}>Delete mode</button>
        </div>
      )}
    </div>
  );
}

// The mode being looked at, as a dropdown, with its actions beside it
function ModeSelector({ modes, selectedModeId, onSelect, onSetActive, onEdit, onCopyDay, onDelete, onCreate }) {
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
      <div className="relative flex-1 min-w-0 max-w-sm" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={`Mode: ${selected.name}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full flex items-center gap-2.5 px-3 py-3 md:py-2.5 rounded-lg border border-line bg-slate-900/60 hover:bg-white/5 transition-colors text-left"
        >
          <span className="text-xl leading-none" aria-hidden="true">{selected.icon}</span>
          <span className="flex-1 min-w-0 font-semibold text-white truncate">{selected.name}</span>
          <svg className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 z-30 w-full min-w-[15rem] rounded-lg bg-slate-900 border border-line shadow-lg py-1">
            <div role="listbox" aria-label="Switch mode" className="max-h-72 overflow-y-auto">
              {modes.map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  role="option"
                  aria-selected={mode.id === selected.id}
                  aria-label={`${mode.name}, ${mode.active ? 'active' : 'not active'}`}
                  onClick={choose(mode.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 md:py-2.5 text-left hover:bg-white/5 active:bg-white/10 ${mode.id === selected.id ? 'bg-white/5' : ''}`}
                >
                  <span className="text-xl leading-none" aria-hidden="true">{mode.icon}</span>
                  <span className={`flex-1 min-w-0 text-sm font-semibold truncate ${mode.id === selected.id ? 'text-primary-300' : 'text-white'}`}>
                    {mode.name}
                  </span>
                  {mode.active && <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-300 shrink-0">Active</span>}
                  {mode.id === selected.id && (
                    <svg className="w-4 h-4 shrink-0 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="my-1 border-t border-line" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreate();
              }}
              className="w-full text-left px-3 py-3 md:py-2.5 text-sm font-semibold text-primary-300 hover:bg-white/5 active:bg-white/10"
            >
              + Create Mode
            </button>
          </div>
        )}
      </div>

      <ModeMenu
        mode={selected}
        onSetActive={() => onSetActive(selected)}
        onEdit={() => onEdit(selected)}
        onCopyDay={onCopyDay}
        onDelete={() => onDelete(selected)}
      />
    </section>
  );
}

export default ModeSelector;
