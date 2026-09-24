import React, { useEffect } from 'react';
import { TYPE_LABELS, TYPE_STYLES } from './CalendarEventCard';
import { eventDuration, longDate, timeLabel } from '../../utils/calendarDate';
import { BellIcon, CalendarIcon } from '../icons';

const iconButton = 'w-10 h-10 flex items-center justify-center rounded-xl transition-colors';

const row = (icon, text, muted) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 text-slate-500 shrink-0" aria-hidden="true">{icon}</span>
    <span className={muted ? 'text-slate-400' : 'text-slate-200'}>{text}</span>
  </div>
);

// An entry's details with Edit and Delete: a bottom sheet on phones, centred on larger screens
function EventDetailsModal({ event, onEdit, onDelete, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const duration = eventDuration(event);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-details-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full md:max-w-md rounded-t-xl md:rounded-lg bg-slate-900 border border-line p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-5 shadow-lg animate-slide-up md:animate-fade-in"
      >
        <div className="flex items-center gap-2">
          <h2 className="flex-1 text-lg font-semibold text-white">Event Details</h2>
          <button type="button" onClick={onClose} aria-label="Close" className={`${iconButton} text-slate-400 hover:text-white hover:bg-white/10`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex items-start gap-3">
          <span className={`w-12 h-12 shrink-0 rounded-lg border flex items-center justify-center text-2xl ${TYPE_STYLES[event.type].badge}`} aria-hidden="true">
            {event.type === 'REMINDER' ? <BellIcon /> : <CalendarIcon />}
          </span>
          <div className="flex-1 min-w-0">
            <h3 id="event-details-title" className="text-xl font-semibold text-white break-words">{event.title}</h3>
            <p className="text-sm text-slate-400">{TYPE_LABELS[event.type]}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={onEdit} aria-label="Edit" className={`${iconButton} text-primary-300 bg-primary-500/10 hover:bg-primary-500/20`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button type="button" onClick={onDelete} aria-label="Delete" className={`${iconButton} text-rose-300 bg-rose-500/10 hover:bg-rose-500/20`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-4">
          {row(
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            longDate(event.date)
          )}
          {row(
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            `${timeLabel(event)}${duration ? ` (${duration})` : ''}`,
            true
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;
