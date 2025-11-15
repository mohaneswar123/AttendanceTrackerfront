import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark-primary text-light-primary border-t border-primary-500/20">
      <div className="container px-4 py-6 text-center">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link to="/privacy-policy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link>
          <Link to="/about-us" className="hover:text-primary-500 transition-colors">About Us</Link>
          <Link to="/contact-us" className="hover:text-primary-500 transition-colors">Contact Us</Link>
          <Link to="/terms" className="hover:text-primary-500 transition-colors">T&C</Link>
        </div>
        <p className="text-xs text-light-primary/70">© 2025 Attendance Register. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
