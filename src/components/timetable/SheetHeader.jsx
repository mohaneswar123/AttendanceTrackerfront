import React from 'react';

// The top of a timetable sheet: a close button on the left, the title centred
function SheetHeader({ id, title, onClose }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/10"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 id={id} className="flex-1 text-center text-lg font-semibold text-white pr-7">{title}</h2>
    </div>
  );
}

export default SheetHeader;
