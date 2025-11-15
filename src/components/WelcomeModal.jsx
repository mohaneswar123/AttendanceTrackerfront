import React, { useState, useEffect } from 'react';

function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenModal = sessionStorage.getItem('hasSeenWelcomeModal');
    
    if (!hasSeenModal) {
      // Show modal after a brief delay for better UX
      setTimeout(() => {
        setIsOpen(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      }, 500);
    }

    // Cleanup function to restore scroll if component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
    // Remember that user has seen the modal for this session
    sessionStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-dark-secondary rounded-2xl shadow-2xl max-w-lg w-full my-8 overflow-hidden animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-dark-secondary via-primary-500 to-dark-secondary p-4 sm:p-6 text-light-primary text-center">
          <div className="text-4xl sm:text-5xl mb-2">🎭</div>
          <h2 className="text-xl sm:text-2xl font-bold">Oops! Houston, We Have a Situation!</h2>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <div className="bg-dark-primary border-l-4 border-yellow-500 p-3 sm:p-4 rounded-r-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div className="text-xs sm:text-sm text-light-primary">
                <p className="font-semibold text-yellow-400 mb-2">Backend Server Status: Taking a Coffee Break ☕</p>
                <p className="mb-2">
                  Our backend server is currently enjoying an unexpected vacation (aka "my cloud credits ran out faster than expected! 😅").
                </p>
                <p className="mb-2">
                  <strong>Good news:</strong> You can still explore the entire app, browse all pages, and check out the beautiful UI we've crafted! ✨
                </p>
                <p className="text-xs text-light-primary/70 italic mt-3">
                  Think of it as "demo mode" - like window shopping, but for attendance tracking! 🛍️
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-primary border border-primary-500/30 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-primary-400">
              <strong>🔧 What's Working:</strong> All pages, UI, navigation, and frontend features
            </p>
            <p className="text-xs sm:text-sm text-primary-400 mt-2">
              <strong>💤 What's Napping:</strong> Database connections and API calls
            </p>
          </div>

          <p className="text-xs text-light-primary/50 text-center italic">
            "It's not a bug, it's a feature... that requires server credits!" 😄
          </p>
        </div>

        {/* Footer with close button */}
        <div className="bg-dark-primary px-4 sm:px-6 py-3 sm:py-4 flex justify-center">
          <button
            onClick={handleClose}
            className="bg-primary-500 hover:bg-primary-600 text-dark-primary font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-lg shadow-md transform transition hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            Got it! Let me explore 🚀
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default WelcomeModal;
