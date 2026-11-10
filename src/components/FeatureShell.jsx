import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { featureForPath, toneOf } from '../features/registry';
import FeatureHeader from './nav/FeatureHeader';
import FeatureBottomNav from './nav/FeatureBottomNav';
import QuickSwitcher from './nav/QuickSwitcher';

const LAST_TAB_KEY = 'lastTabPerFeature';

const readLastTabs = () => {
  try {
    return JSON.parse(localStorage.getItem(LAST_TAB_KEY)) || {};
  } catch {
    return {};
  }
};

/** Where the student last was in each feature, so coming back lands where they left */
export const lastTabs = readLastTabs;

/**
 * Everything around a feature's content: which app you are in, its sections, and the
 * way out to Home or to another app.
 *
 * Sections are the bottom bar on a phone and a row of tabs on a wider screen, because a
 * bar pinned to the bottom of a desktop window is a long way from where you are reading.
 */
function FeatureShell({ onAdd, actions, subtitle, children }) {
  const { pathname } = useLocation();
  const { feature, tab } = featureForPath(pathname);
  const [switching, setSwitching] = useState(false);
  const closeSwitcher = useCallback(() => setSwitching(false), []);

  // Remember the section, so Home and the switcher come back to it
  useEffect(() => {
    if (!feature || !tab) return;
    try {
      localStorage.setItem(LAST_TAB_KEY, JSON.stringify({ ...readLastTabs(), [feature.id]: tab.path }));
    } catch {
      // It just will not be remembered
    }
  }, [feature, tab]);

  if (!feature) return children;

  const tone = toneOf(feature.id);

  return (
    <>
      <div className="space-y-4">
        <FeatureHeader
          feature={feature}
          tabLabel={tab?.label || feature.name}
          subtitle={subtitle}
          onSwitch={() => setSwitching(true)}
          onAdd={onAdd}
        >
          {actions}
        </FeatureHeader>

        {/* On a pointer the sections sit under the title; on a phone they are the bottom bar */}
        <div
          className="hidden md:flex p-1 rounded-xl bg-background-surface border border-line"
          role="tablist"
          aria-label={`${feature.name} sections`}
        >
          {feature.tabs.map(item => {
            const current = item.id === tab?.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                role="tab"
                aria-selected={current}
                className={`flex-1 h-9 px-2 rounded-lg text-sm font-medium whitespace-nowrap grid place-items-center transition-colors ${current
                  ? `bg-background-paper ${tone.text} shadow-sm`
                  : 'text-slate-500 hover:text-slate-300'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>

      <FeatureBottomNav feature={feature} />

      {switching && (
        <QuickSwitcher currentId={feature.id} lastTab={readLastTabs()} onClose={closeSwitcher} />
      )}
    </>
  );
}

export default FeatureShell;
