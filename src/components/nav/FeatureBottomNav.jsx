import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toneOf } from '../../features/registry';
import { GridIcon, PlusIcon } from '../icons';

/**
 * The bottom bar inside a feature. It lists that feature's own sections and nothing
 * else, so the bar stops being a place every new feature has to win a slot in.
 *
 * Home is always leftmost, behind a divider, because it is a way out rather than another
 * section of this feature.
 *
 * Only the section you are on is named. Four labels at 10px are harder to read than one at
 * a readable size, and the icons carry the rest. The names are still in the markup for
 * screen readers — hidden to the eye, not to the page.
 *
 * The bar keeps its own colour in both colour sets rather than flipping with the page: it
 * is a bar, not another panel. The section you are on wears the page's background, so the
 * feature's colour sits on it at the contrast the rest of the app already uses.
 */
function FeatureBottomNav({ feature, onAdd }) {
  const { pathname } = useLocation();
  const tone = toneOf(feature.id);

  // Longest path first, so /tasks/important does not light up /tasks
  const active = [...feature.tabs]
    .sort((a, b) => b.path.length - a.path.length)
    .find(tab => pathname === tab.path || pathname.startsWith(`${tab.path}/`));

  return (
    <nav
      aria-label={`${feature.name} sections`}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-full bg-nav px-2.5 py-2 shadow-lg">
        <Link
          to="/"
          className="w-11 h-11 shrink-0 grid place-items-center rounded-full text-nav-ink/70 hover:text-nav-ink transition-colors"
        >
          <GridIcon className="w-[22px] h-[22px]" />
          <span className="sr-only">Home</span>
        </Link>

        <span className="w-px h-6 shrink-0 bg-nav-ink/25" aria-hidden="true" />

        <div className="flex flex-1 items-center justify-around gap-1">
          {feature.tabs.map(tab => {
            const current = tab.id === active?.id;
            const TabIcon = tab.Icon || feature.Icon;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                aria-current={current ? 'page' : undefined}
                className={`h-11 shrink-0 min-w-[44px] grid place-items-center rounded-full transition-colors ${current
                  ? `bg-background ${tone.text} px-3.5 gap-2 grid-flow-col font-bold`
                  : 'w-11 text-nav-ink/70 hover:text-nav-ink'}`}
              >
                <TabIcon className="w-[22px] h-[22px]" filled={current} />
                <span className={current ? 'text-sm whitespace-nowrap' : 'sr-only'}>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* The main action of every feature, in the thumb zone. It used to live at the top
            right, about 20px from the top edge, which is the hardest place to reach
            one-handed on a big phone. Home anchors the left of the pill, this the right. */}
        {onAdd && (
          <>
            <span className="w-px h-6 shrink-0 bg-nav-ink/25" aria-hidden="true" />
            <button
              type="button"
              onClick={onAdd}
              aria-label={feature.addLabel || `Add to ${feature.name}`}
              className={`w-11 h-11 shrink-0 grid place-items-center rounded-full text-white transition-colors ${tone.bg} ${tone.hover}`}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default FeatureBottomNav;
