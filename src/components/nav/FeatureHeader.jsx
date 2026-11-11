import React from 'react';
import { toneOf } from '../../features/registry';
import { ChevronDownIcon, PlusIcon } from '../icons';
import { longWeekday } from '../../utils/attendance';
import { todayLocal } from '../../utils/date';

/**
 * The top of every feature screen: which app you are in, the one action that app is
 * for, then the date and the section you are looking at.
 *
 * The feature name is a button rather than a label, because it is also how you leave for
 * another feature, and a chevron is the usual way to say so.
 */
function FeatureHeader({ feature, tabLabel, subtitle, onSwitch, onAdd, children }) {
  const tone = toneOf(feature.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSwitch}
          aria-haspopup="dialog"
          aria-label={`${feature.name}. Switch to another app`}
          className={`h-10 pl-2.5 pr-3 rounded-full flex items-center gap-2 text-sm font-semibold transition-colors ${tone.tint} ${tone.text}`}
        >
          <feature.Icon className="w-[18px] h-[18px]" />
          {feature.name}
          <ChevronDownIcon className="w-4 h-4 opacity-70" />
        </button>

        <div className="flex items-center gap-2 shrink-0 min-w-0">
          {children}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              aria-label={feature.addLabel || `Add to ${feature.name}`}
              title={feature.addLabel}
              // On a phone this lives in the bottom bar instead, within reach of a thumb
              className={`hidden md:grid w-10 h-10 rounded-full place-items-center text-white transition-colors ${tone.bg} ${tone.hover}`}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* The name of the section first, then what today makes of it: the title is what
          someone is looking for, and the date only means something once they have found it */}
      <div className="min-w-0">
        <h1 className="text-[34px] leading-[1.1] font-bold tracking-tight text-white">{tabLabel}</h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle ?? longWeekday(todayLocal())}</p>
      </div>
    </div>
  );
}

export default FeatureHeader;
