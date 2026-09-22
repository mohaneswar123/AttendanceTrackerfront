import React, { useEffect } from 'react';
import { TYPE_LABELS, TYPE_STYLES } from './CalendarEventCard';
import { longDate, timeLabel } from '../../utils/calendarDate';

// An entry's details with Edit and Delete: a bottom sheet on phones, centred on larger screens
function EventDetailsModal({ event, onEdit, onDelete, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-details-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl bg-slate-900 border border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 shadow-2xl animate-slide-up md:animate-fade-in"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className={`inline-block mb-2 px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wide ${TYPE_STYLES[event.type].badge}`}>
              {event.type === 'REMINDER' && '🔔 '}{TYPE_LABELS[event.type]}
            </span>
            <h2 id="event-details-title" className="text-xl font-semibold text-white break-words">{event.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            ✕
          </button>
        </div>

        <div className="space-y-1 text-slate-300">
          <p>{longDate(event.date)}</p>
          <p className="text-slate-400">{timeLabel(event)}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 md:flex md:justify-end">
          <button type="button" onClick={onDelete} className="px-4 py-3 md:py-2 rounded-xl text-sm font-semibold text-rose-300 border border-rose-500/40 hover:bg-rose-500/10">
            Delete
          </button>
          <button type="button" onClick={onEdit} className="px-4 py-3 md:py-2 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;
