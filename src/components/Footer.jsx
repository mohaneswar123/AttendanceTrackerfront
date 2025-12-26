import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-8 mt-auto backdrop-blur-sm bg-background/50">
      <div className="container px-4 text-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link to="/privacy-policy" className="text-slate-400 hover:text-primary-400 transition-colors">Privacy Policy</Link>
          <Link to="/about-us" className="text-slate-400 hover:text-primary-400 transition-colors">About Us</Link>
          <Link to="/contact-us" className="text-slate-400 hover:text-primary-400 transition-colors">Contact Us</Link>
          <Link to="/terms" className="text-slate-400 hover:text-primary-400 transition-colors">T&C</Link>
        </div>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Attendance Register. Crafted with <span className="text-rose-500 animate-pulse">❤</span> for efficiency.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
