import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PHONE_NAV_ITEMS, isNavActive } from './Sidebar';

// Five flat items. Settings is not one of them: it is the gear beside the page title,
// because it is somewhere you visit rarely, not somewhere you switch between.
function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background-paper border-t border-line pb-safe-area"
    >
      <div className="flex h-14">
        {PHONE_NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = isNavActive(to, location.pathname);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-primary-400' : 'text-slate-500'}`}
            >
              <Icon className="w-[22px] h-[22px]" filled={active} />
              <span className={`text-[10px] tracking-tight whitespace-nowrap ${active ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
