import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AdBanner from './AdBanner'; // Ensure correct path

function Layout({ children }) {
  return (
    <div className="pt-[4rem] min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed Header Only */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Ad Banner that scrolls */}
      <div className="w-full bg-black px-4 py-2 border-b border-gray-200 shadow">
        <div className="max-w-6xl mx-auto">
          <AdBanner />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-4">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Layout;
