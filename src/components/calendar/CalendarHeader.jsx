import React from 'react';

const navButton = 'w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 active:bg-white/15';

// "September 2026" with Today and previous/next
function CalendarHeader({ title, periodName, loading, onToday, onPrevious, onNext }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Calendar{loading && ' · loading…'}</p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white tracking-tight leading-tight">{title}</h1>
      </div>
      <button type="button" onClick={onToday} className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-slate-200 hover:bg-white/10 active:bg-white/15">
        Today
      </button>
      <button type="button" onClick={onPrevious} aria-label={`Previous ${periodName}`} className={navButton}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button type="button" onClick={onNext} aria-label={`Next ${periodName}`} className={navButton}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

export default CalendarHeader;
