import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--light)',
      }}
    >
      <div
        style={{
          background: 'var(--primary)',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '320px',
          color: 'var(--text-on-primary)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
