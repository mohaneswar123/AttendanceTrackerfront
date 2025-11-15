import React from 'react';
import { Link } from 'react-router-dom';

// Beautiful animated gradient welcome banner with floating particles
function WelcomeBanner({ currentUser }) {
  const userName = currentUser?.username || currentUser?.name;
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-elevated mb-6">
      {/* Modern gradient background with animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-secondary via-primary-500 to-dark-secondary bg-[length:200%_200%] animate-gradient-x" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-[10%] w-12 h-12 bg-primary-500/30 rounded-full blur-lg animate-float" />
        <div className="absolute top-3 right-[15%] w-10 h-10 bg-primary-400/20 rounded-full blur-md animate-float-slow" style={{animationDelay: '1s'}} />
        <div className="absolute top-2 right-[30%] w-8 h-8 bg-primary-500/25 rounded-full blur-md animate-float" style={{animationDelay: '2s'}} />
      </div>

      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-5 py-4 flex flex-wrap items-baseline gap-2 justify-between">
        {userName ? (
          <>
            <div className="animate-fade-in flex flex-wrap items-baseline gap-2">
              <h2 className="text-lg md:text-xl font-bold">
                {"Welcome back,".split('').map((char, i) => (
                  <span 
                    key={i} 
                    className="inline-block animate-wave text-light-primary"
                    style={{
                      animationDelay: `${i * 0.05}s`
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h2>
              <h3 className="text-xl md:text-2xl font-extrabold">
                {`${userName}!`.split('').map((char, i) => (
                  <span 
                    key={i} 
                    className="inline-block animate-bounce-subtle"
                    style={{
                      animationDelay: `${i * 0.08}s`,
                      color: '#FF2E63'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </h3>
            </div>
            <p className="hidden sm:block text-light-primary text-sm font-medium animate-slide-up">
              ✨ Track your attendance
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight animate-fade-in">
              <span>
                {"Welcome to Attendance Tracker!".split('').map((char, i) => (
                  <span 
                    key={i} 
                    className="inline-block animate-wave text-light-primary"
                    style={{
                      animationDelay: `${i * 0.03}s`
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            </h2>
            <p className="hidden sm:block text-light-primary text-sm font-medium animate-slide-up">
              <Link to="/login" className="font-bold underline hover:text-primary-400 transition-colors">Login</Link>
            </p>
          </>
        )}
      </div>
      
      {/* Soft glow effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-primary/30 to-transparent" />
    </div>
  );
}

export default WelcomeBanner;