import React from 'react';

function LoadingIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-dark-primary opacity-90 flex flex-col items-center justify-center">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-dark-secondary h-12 w-12 mb-4 border-t-primary-500 animate-spin"></div>
      <h2 className="text-center text-light-primary text-xl font-semibold">Loading...</h2>
      <p className="w-1/3 text-center text-light-primary">This may take a few seconds, please wait...</p>
    </div>
  );
}

export default LoadingIndicator;