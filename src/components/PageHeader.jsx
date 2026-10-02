import React from 'react';

// Every page opens the same way: a quiet line of context, the page's name, and whatever
// buttons belong to that page on the right.
function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {/* A div, not a p: the eyebrow is sometimes a control, such as the mode dropdown */}
        {eyebrow && <div className="text-sm text-slate-500 mb-0.5">{eyebrow}</div>}
        <h1 className="text-[28px] leading-8 font-bold tracking-tight text-white">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2 shrink-0 pt-1">{children}</div>}
    </div>
  );
}

// The round buttons that sit beside a page title
export function HeaderButton({ label, onClick, children, variant = 'plain' }) {
  const styles = variant === 'primary'
    ? 'bg-primary-600 text-primary-foreground hover:bg-primary-700'
    : 'bg-background-paper border border-line text-slate-400 hover:text-slate-200';
  // 44px on phones so it can be tapped, a little smaller once there is a pointer
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${styles}`}
    >
      {children}
    </button>
  );
}

export default PageHeader;
