import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURES, toneOf } from '../../features/registry';
import { GridIcon } from '../icons';

/**
 * Jump straight from one feature to another without going back to Home first.
 *
 * It opens from the feature name in the header, which is where someone looks when they
 * want to know, or change, which app they are in.
 */
function QuickSwitcher({ currentId, lastTab, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center justify-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Switch to"
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl overlay p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5 space-y-4 animate-slide-up md:animate-fade-in"
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto md:hidden" aria-hidden="true" />

        <h2 className="section-title">Switch to</h2>

        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map(feature => {
            const tone = toneOf(feature.id);
            const current = feature.id === currentId;
            // Back to the tab they were last on in that feature, not always its first
            const path = lastTab?.[feature.id] || feature.tabs[0].path;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => go(path)}
                aria-current={current ? 'true' : undefined}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${current
                  ? `${tone.tint} ${tone.border}`
                  : 'border-line hover:bg-white/5'}`}
              >
                <span className={`w-10 h-10 rounded-xl grid place-items-center ${tone.tint} ${tone.text}`}>
                  <feature.Icon className="w-5 h-5" />
                </span>
                <span className={`text-xs font-medium text-center ${current ? tone.text : 'text-slate-300'}`}>
                  {feature.name}
                </span>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => go('/')} className="btn btn-secondary w-full">
          <GridIcon className="w-4 h-4" />
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default QuickSwitcher;
