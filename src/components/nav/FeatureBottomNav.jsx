import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toneOf } from '../../features/registry';
import { GridIcon } from '../icons';

/**
 * The bottom bar inside a feature. It lists that feature's own sections and nothing
 * else, so the bar stops being a place every new feature has to win a slot in.
 *
 * Home is always leftmost, behind a divider, because it is a way out rather than another
 * section of this feature.
 */
function FeatureBottomNav({ feature }) {
  const { pathname } = useLocation();
  const tone = toneOf(feature.id);

  // Longest path first, so /tasks/board does not light up /tasks
  const active = [...feature.tabs]
    .sort((a, b) => b.path.length - a.path.length)
    .find(tab => pathname === tab.path || pathname.startsWith(`${tab.path}/`));

  return (
    <nav
      aria-label={`${feature.name} sections`}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background-paper border-t border-line pb-safe-area"
    >
      <div className="flex items-stretch">
        <Link
          to="/"
          aria-label="Home"
          className="w-16 shrink-0 min-h-[56px] flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <GridIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <span className="w-px my-3 bg-line shrink-0" aria-hidden="true" />

        <div className="flex-1 flex items-stretch">
          {feature.tabs.map(tab => {
            const current = tab.id === active?.id;
            const TabIcon = tab.Icon || feature.Icon;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                aria-current={current ? 'page' : undefined}
                className="flex-1 min-w-0 min-h-[56px] flex flex-col items-center justify-center gap-1 px-1 transition-colors"
              >
                <span
                  className={`h-6 px-2.5 rounded-full grid place-items-center transition-colors ${current ? `${tone.tint} ${tone.text}` : 'text-slate-500'}`}
                >
                  <TabIcon className="w-[18px] h-[18px]" filled={current} />
                </span>
                <span
                  className={`text-[10px] tracking-tight whitespace-nowrap ${current ? `${tone.text} font-bold` : 'text-slate-500 font-medium'}`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default FeatureBottomNav;
