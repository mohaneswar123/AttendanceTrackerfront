import React from 'react';
import { nowYear } from '../utils/date';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../branding';

const LINKS = [
  { to: '/privacy-policy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/about-us', label: 'About' },
  { to: '/contact-us', label: 'Contact' }
];

/**
 * Privacy, Terms, About and Contact.
 *
 * These used to be desktop-only, which meant a student signing up on a phone handed over
 * their name and email with no way to read the privacy policy first. On a phone the links
 * wrap into a row of 44px targets and the copyright drops underneath; on a wider screen it
 * is the one quiet line it always was.
 */
function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-5 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-1 md:gap-4 text-sm text-slate-400">
        <p className="px-1">© {nowYear()} {APP_NAME}</p>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-0 md:gap-5" aria-label="Legal">
          {LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="h-11 md:h-auto px-2 md:px-0 inline-flex items-center hover:text-slate-200 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
