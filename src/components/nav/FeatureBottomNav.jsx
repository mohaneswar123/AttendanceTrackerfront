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
 * The + floats above the bar rather than sitting inside it. It lived in the pill once,
 * fixed at 44px like everything beside it, and on Attendance — Home, four sections and
 * the + — that added up to more bar than a 375px phone has: the + poked out of the pill
 * at 390, was mostly off-screen at 360, and had vanished entirely at 320. A row that
 * cannot shrink loses whatever is rightmost, and the rightmost thing was the main action
 * of the feature. Floating it costs nothing and fits every width.
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
      {onAdd && (
        <div className="mx-auto max-w-md flex justify-end mb-3 pr-0.5">
          <button
            type="button"
            onClick={onAdd}
            aria-label={feature.addLabel || `Add to ${feature.name}`}
            className={`pointer-events-auto w-12 h-12 rounded-full grid place-items-center text-white shadow-lg transition-colors ${tone.bg} ${tone.hover}`}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-full bg-nav px-2.5 py-2 shadow-lg">
        <Link
          to="/"
          className="w-11 h-11 shrink-0 grid place-items-center rounded-full text-nav-ink/70 hover:text-nav-ink transition-colors"
        >
          <GridIcon className="w-[22px] h-[22px]" />
          <span className="sr-only">Home</span>
        </Link>

        <span className="w-px h-6 shrink-0 bg-nav-ink/25" aria-hidden="true" />

        {/* min-w-0 so this region can shrink; only the named tab gives up width, and its
            label truncates before anything falls off the end of the pill */}
        <div className="flex flex-1 min-w-0 items-center justify-around gap-1">
          {feature.tabs.map(tab => {
            const current = tab.id === active?.id;
            const TabIcon = tab.Icon || feature.Icon;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                aria-current={current ? 'page' : undefined}
                className={`h-11 rounded-full transition-colors ${current
                  ? `min-w-0 flex items-center justify-center bg-background ${tone.text} px-3 gap-1.5 font-bold`
                  : 'w-11 shrink-0 grid place-items-center text-nav-ink/70 hover:text-nav-ink'}`}
              >
                <TabIcon className="w-[22px] h-[22px] shrink-0" filled={current} />
                <span className={current ? 'text-sm whitespace-nowrap truncate' : 'sr-only'}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default FeatureBottomNav;
