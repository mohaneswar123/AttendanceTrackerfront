import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <div className="mb-2">
          <Link to="/privacy-policy" className="mx-3 hover:underline">Privacy Policy</Link>
          <Link to="/about-us" className="mx-3 hover:underline">About Us</Link>
          <Link to="/contact-us" className="mx-3 hover:underline">Contact Us</Link>
          <Link to="/terms" className="mx-3 hover:underline">T&C</Link>
        </div>
        <p className="text-sm text-gray-400">© 2025 Attendance Register. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
