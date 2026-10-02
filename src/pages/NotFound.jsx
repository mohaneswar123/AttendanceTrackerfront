import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">404</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Page not found</h1>
          <p className="mt-2 text-sm text-slate-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
          <Link to="/" className="btn btn-primary">Back to attendance</Link>
          <Link to="/login" className="btn btn-secondary">Go to sign in</Link>
        </div>

        <div className="mt-8 text-slate-500 text-sm">
          <p>Need help? <Link to="/contact-us" className="text-primary-400 hover:underline">Contact Support</Link></p>
          
          <div className="mt-4">
            <Link to="/" className="inline-block mx-2 hover:text-primary-500">Home</Link>
            <Link to="/about-us" className="inline-block mx-2 hover:text-primary-500">About Us</Link>
            <Link to="/contact-us" className="inline-block mx-2 hover:text-primary-500">Contact</Link>
          </div>
          
          <p className="mt-8">© 2025 Attendance Register. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;