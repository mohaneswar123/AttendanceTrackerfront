import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';

function Layout({ children }) {
  const location = useLocation();
  const { error } = useContext(AttendanceContext);

  // Route-based robots control: index the homepage, noindex the rest
  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', location.pathname === '/' ? 'index, follow' : 'noindex, nofollow');
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="md:hidden">
        <Header />
      </div>

      <div className="md:ml-60 flex flex-col min-h-screen">
        <main className="flex-1 w-full px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="notice notice-danger mb-6" role="alert">
                <span className="flex-1">{error}</span>
                <button onClick={() => window.location.reload()} className="font-medium underline underline-offset-2">
                  Retry
                </button>
              </div>
            )}
            {children}
          </div>
        </main>

        <div className="hidden md:block">
          <Footer />
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

export default Layout;
