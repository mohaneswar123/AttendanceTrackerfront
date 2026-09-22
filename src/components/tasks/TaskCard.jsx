import React, { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { STATUSES, STATUS_LABELS } from '../../hooks/useTaskBoard';
import { dateLabel, todayLocal } from '../../utils/date';

const PRIORITY_STYLES = {
  HIGH: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  LOW: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
};

const PRIORITY_LABELS = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };

// Keeps presses on the card's buttons from starting a drag
const noDrag = {
  onMouseDown: (e) => e.stopPropagation(),
  onTouchStart: (e) => e.stopPropagation(),
  onKeyDown: (e) => e.stopPropagation()
};

// The card's content; also drawn under the pointer while dragging
export function TaskCardBody({ task, dragging = false, onMarkDone, onMoveTo, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const done = task.status === 'DONE';
  const overdue = !done && task.taskDate < todayLocal();

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      document.removeEventListener('keydown', close);
    };
  }, [menuOpen]);

  const choose = (action) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    // The glass effect makes each card its own layer, so lift the one whose menu is open
    <div
      className={`glass-card relative p-4 select-none ${menuOpen ? 'z-20' : ''} ${dragging ? 'shadow-neon-primary rotate-1 cursor-grabbing' : 'cursor-grab'} ${done ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {task.priority && (
            <span className={`inline-block mb-2 px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          )}
          <h4 className={`font-semibold text-slate-100 break-words ${done ? 'line-through text-slate-400' : ''}`}>{task.title}</h4>
          <p className={`mt-2 text-xs font-medium flex items-center gap-1.5 ${overdue ? 'text-rose-400' : 'text-slate-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {dateLabel(task.taskDate)}{overdue && ' · overdue'}
          </p>
        </div>

        {!dragging && (
          <div className="flex items-center gap-1 -mr-1 -mt-1" {...noDrag}>
            {!done && (
              <button
                onClick={onMarkDone}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title="Mark done"
                aria-label={`Mark "${task.title}" done`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              </button>
            )}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(open => !open)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="More actions"
                aria-label={`More actions for "${task.title}"`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-full mt-1 z-30 w-44 rounded-xl bg-slate-900 border border-white/10 shadow-2xl py-1 text-sm">
                  {STATUSES.filter(s => s !== task.status).map(status => (
                    <button key={status} role="menuitem" onClick={choose(() => onMoveTo(status))} className="w-full text-left px-3 py-2 text-slate-300 hover:bg-white/5">
                      Move to {STATUS_LABELS[status]}
                    </button>
                  ))}
                  <div className="my-1 border-t border-white/5" />
                  <button role="menuitem" onClick={choose(onEdit)} className="w-full text-left px-3 py-2 text-slate-300 hover:bg-white/5">Edit</button>
                  <button role="menuitem" onClick={choose(onDelete)} className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10">Delete</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// A card that can be dragged within and between columns
function TaskCard({ task, ...actions }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isDragging ? 'opacity-30' : ''}`}
      {...attributes}
      {...listeners}
    >
      <TaskCardBody task={task} {...actions} />
    </div>
  );
}

export default TaskCard;
