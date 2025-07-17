import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <div className="mt-4 relative">
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 w-24 mx-auto mb-5"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h2>
            <p className="text-gray-600 mb-5">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link 
            to="/"
            className="block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Return to Dashboard
          </Link>
          
          <Link 
            to="/login"
            className="block bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm border border-gray-300"
          >
            Go to Login
          </Link>
        </div>
        
        <div className="mt-8 text-gray-500 text-sm">
          <p>Need help? <Link to="/contact-us" className="text-indigo-600 hover:underline">Contact Support</Link></p>
          
          <div className="mt-4">
            <Link to="/" className="inline-block mx-2 hover:text-indigo-600">Home</Link>
            <Link to="/about-us" className="inline-block mx-2 hover:text-indigo-600">About Us</Link>
            <Link to="/contact-us" className="inline-block mx-2 hover:text-indigo-600">Contact</Link>
          </div>
          
          <p className="mt-8">© 2025 Attendance Register. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;