import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AdBanner from './AdBanner'; // Make sure path is correct

function Layout({ children }) {
  return (
    <div className="pt-[7.5rem] min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />

        {/* ✅ AdBanner just below Header */}
        <div className="bg-white px-4 py-2 border-t border-b border-gray-200 shadow">
          <div className="max-w-6xl mx-auto">
            <AdBanner />
          </div>
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
