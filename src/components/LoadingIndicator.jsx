import React from 'react';

function LoadingIndicator() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-primary/80 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-dark-secondary/40 border-t-primary-500 animate-[spin_1s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border-4 border-dark-secondary/30 border-t-primary-400 animate-[spin_1.6s_linear_infinite_reverse]"></div>
          <div className="absolute inset-4 rounded-full border-4 border-dark-secondary/20 border-t-primary-300 animate-[spin_2.2s_linear_infinite]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-primary-500 animate-ping"></div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-light-primary text-lg font-semibold tracking-wide">
            Loading
            <span className="inline-flex w-8 justify-between pl-1 align-middle">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:0ms]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:150ms]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:300ms]"></span>
            </span>
          </h2>
          <p className="text-light-primary/80 text-sm">This may take a few seconds, please wait…</p>
          <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-dark-secondary/30">
            <div className="h-full w-1/2 bg-primary-500/80 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingIndicator;