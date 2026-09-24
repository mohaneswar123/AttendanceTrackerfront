import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, isNavActive } from './Sidebar';

function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background-paper border-t border-line pb-safe-area"
    >
      {/* Six equal items; labels stay on one line even on 360px phones */}
      <div className="flex h-14">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = isNavActive(to, location.pathname);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-primary-400' : 'text-slate-500'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
