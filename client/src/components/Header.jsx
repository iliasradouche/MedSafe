// client/src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Button }            from 'primereact/button';
import { Sidebar }           from 'primereact/sidebar';
import { PanelMenu }         from 'primereact/panelmenu';
import { useNavigate }       from 'react-router-dom';
import { menuItemsByRole }   from '../config/menuItems';
import useAuth               from '../auth/useAuth';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only build nav items if logged in
  const navItems = user
    ? menuItemsByRole
        .filter(item => item.roles.includes(user.role))
        .map(item => ({
          label: item.label,
          icon:  item.icon,
          command: () => {
            navigate(item.to);
            setMenuVisible(false);
          }
        }))
    : [];

  const handleAuth = async () => {
    if (user) {
      await logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile sidebar menu */}
      <Sidebar visible={menuVisible} onHide={() => setMenuVisible(false)}>
        <PanelMenu model={navItems} style={{ border: 'none' }} />
      </Sidebar>

      <header style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0.5rem 1rem',
        background:     'var(--primary)'
      }}>
        {/* Burger icon on mobile */}
        {isMobile && user && (
          <Button
            icon="pi pi-bars"
            className="p-button-text"
            style={{ color: 'var(--text-on-primary)' }}
            onClick={() => setMenuVisible(true)}
          />
        )}

        {/* Logo / Title */}
        <div
          style={{
            cursor:      'pointer',
            color:       'var(--text-on-primary)',
            fontSize:    '1.5rem',
            fontWeight:  'bold'
          }}
          onClick={() => navigate('/')}
        >
          Med Safe
        </div>

        <div className="p-d-flex p-ai-center">
          {/* Home button always */}
          <Button
            icon="pi pi-home"
            className="p-button-text p-mr-2"
            style={{ color: 'var(--text-on-primary)' }}
            onClick={() => navigate('/')}
          />

          {!user ? (
            <>
              <Button
                label="Login"
                icon="pi pi-sign-in"
                className="p-button-text p-mr-2"
                style={{ color: 'var(--text-on-primary)' }}
                onClick={() => navigate('/login')}
              />
              <Button
                label="Register"
                icon="pi pi-user-plus"
                className="p-button-text"
                style={{ color: 'var(--text-on-primary)' }}
                onClick={() => navigate('/register')}
              />
            </>
          ) : (
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              className="p-button-text"
              style={{ color: 'var(--text-on-primary)' }}
              onClick={handleAuth}
            />
          )}
        </div>
      </header>
    </>
  );
}
