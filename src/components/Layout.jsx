import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AdBanner from './AdBanner'; // Ensure correct path

function Layout({ children }) {
  const location = useLocation();

  // List of routes where you want to show ads
  const showAdOnRoutes = [
    '/', 
    '/dashboard', 
    '/history',
    '/reports',
    '/settings',
    '/privacy-policy',
    '/about-us',
    '/contact-us',
    '/terms'
  ];
  const showAd = showAdOnRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      {/* Header now fixed internally with consistent height */}
      <Header />
      <div className="h-16" />

  

      {/* Main Content */}
      <main className="flex-grow px-2 md:px-4">
        {children}
      </main>

      {/* Conditionally show Ad Banner */}
      {/* {showAd && (
        <div className="w-full bg-transparent px-4 py-2 border-b border-gray-200 shadow">
          <div className="max-w-6xl mx-auto">
            <AdBanner />
            <p className="text-black-990 text-sm">for ads</p>
          </div>
        </div>
      )} */}
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Layout;
