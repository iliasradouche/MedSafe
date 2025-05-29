// client/src/layouts/PublicLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PublicLayout() {
  return (
    <div>
      {/* MainHeader */}
      <Header />
      {/* Page content */}
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
