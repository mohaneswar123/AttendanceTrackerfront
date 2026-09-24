import React from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/privacy-policy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/about-us', label: 'About' },
  { to: '/contact-us', label: 'Contact' }
];

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Attendance In Hand</p>
        <nav className="flex items-center gap-5" aria-label="Legal">
          {LINKS.map(link => (
            <Link key={link.to} to={link.to} className="hover:text-slate-300 transition-colors">{link.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
