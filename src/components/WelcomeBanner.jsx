import React from "react";
import { Link } from "react-router-dom";

function WelcomeBanner({ currentUser }) {
  const isLoggedIn = !!currentUser;
  const displayName = currentUser?.username || currentUser?.name || "User";

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 py-4 px-6 
      bg-gradient-to-br from-[#1a1a1d] via-[#2d2d33] to-[#1a1a1d] 
      border border-white/10 backdrop-blur-xl">

      {/* Neon outer glow */}
      <div className="absolute inset-0 pointer-events-none 
        bg-[radial-gradient(circle_at_top_right,_rgba(255,115,150,0.25),transparent_60%)]" />

      {/* Animated gradient ring */}
      <div className="absolute -inset-[2px] rounded-3xl 
        bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 
        opacity-30 animate-pulse blur-2xl" />

      {/* Floating hologram particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-6 left-10 w-16 h-16 
          bg-primary-500/15 blur-xl rounded-full animate-float" />

        <div className="absolute bottom-10 right-20 w-20 h-20 
          bg-pink-500/20 blur-2xl rounded-full animate-float-slow" />

        <div className="absolute top-16 right-32 w-10 h-10 
          bg-blue-500/20 blur-xl rounded-full animate-float" 
          style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Shine sweep effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full 
          animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 text-light-primary space-y-3">

        {isLoggedIn ? (
          <>
            {/* WELCOME BACK TITLE */}
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {"Welcome back,"
                .split("")
                .map((char, i) => (
                  <span
                    key={i}
                    className="inline-block animate-wave"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
            </h2>

            {/* USERNAME WITH HOLOGRAM EFFECT */}
            <h3 className="text-2xl md:text-3xl font-extrabold 
              bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 
              bg-clip-text text-transparent animate-gradient-x">
              {displayName}
            </h3>


            <p className="text-sm md:text-base text-light-primary/80 animate-slide-up">
              Managing your attendance made <span className="text-primary-400 font-bold">smart</span> ✨
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {"Welcome to Attendance Tracker".split("").map((char, i) => (
                <span
                  key={i}
                  className="inline-block animate-wave"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h2>

            <p className="text-sm md:text-base text-light-primary/80 animate-slide-up">
              Your smart attendance companion.{" "}
              <Link
                to="/login"
                className="text-primary-400 underline font-semibold hover:text-primary-300 transition"
              >
                Login
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Neon glow bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] 
        bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-70" />
    </div>
  );
}

export default WelcomeBanner;
