import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-primary px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-500">404</h1>
          <div className="mt-4 relative">
            <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-400 w-24 mx-auto mb-5"></div>
            <h2 className="text-3xl font-bold text-light-primary mb-3">Page Not Found</h2>
            <p className="text-light-primary/70 mb-5">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link 
            to="/"
            className="block bg-primary-500 hover:bg-primary-600 text-dark-primary font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Return to Dashboard
          </Link>
          
          <Link 
            to="/login"
            className="block bg-dark-secondary hover:bg-dark-primary text-light-primary font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm border border-primary-500"
          >
            Go to Login
          </Link>
        </div>
        
        <div className="mt-8 text-light-primary/70 text-sm">
          <p>Need help? <Link to="/contact-us" className="text-primary-500 hover:underline">Contact Support</Link></p>
          
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