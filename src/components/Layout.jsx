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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Spacer to prevent overlap with fixed header */}
      <div className="h-16" /> {/* Adjust height as per your Header component */}

  

      {/* Main Content */}
      <main className="flex-grow px-2">
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
