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

  // Route-based robots control: index homepage, noindex others
  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    const value = location.pathname === '/' ? 'index, follow' : 'noindex, nofollow';
    robots.setAttribute('content', value);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-primary-500/30">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for Desktop */}
        <Sidebar />

        {/* content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden md:ml-64 transition-all duration-300">

          {/* Header for Mobile only (Top Bar) */}
          <div className="md:hidden">
            <Header />
          </div>

          <main className="w-full flex-grow p-4 md:p-8 pt-20 md:pt-8 bg-transparent pb-24 md:pb-8">
            {/* Background Gradients for Main Content Area */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[120px]" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary-500/10 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3" role="alert">
                  <span className="text-lg">⚠️</span>
                  <span className="flex-1">{error}</span>
                  <button onClick={() => window.location.reload()} className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 text-xs font-semibold">
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

          {/* Mobile Bottom Nav */}
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}

export default Layout;
