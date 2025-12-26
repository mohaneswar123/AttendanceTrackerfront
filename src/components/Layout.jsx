import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';

function Layout({ children }) {
  const location = useLocation();

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
            <div className="fixed inset-0 z-[-1] pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[120px]" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary-500/10 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto">
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
