import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  MenuOutlined,
  LogoutOutlined,
  UserAddOutlined,
  LoginOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import logo from '../assets/images/MedSafe.png';
import { menuItemsByRole } from '../config/menuItems';

const { Header } = Layout;

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dashboard menu
  const dashboardMenuItems = user
    ? menuItemsByRole
        .filter(item => item.roles.includes(user.role))
        .map(item => ({
          key: item.to,
          icon: item.icon,
          label: item.label,
          onClick: () => { navigate(item.to); setDrawerOpen(false); }
        }))
    : [];

  // Profile/user menu (used only for desktop)
  const userMenuItems = user
    ? [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Profil',
          onClick: () => { navigate('/profile'); },
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Se déconnecter',
          onClick: async () => { await logout(); navigate('/'); },
        },
      ]
    : [
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: 'Se connecter',
          onClick: () => { navigate('/login'); },
        },
        {
          key: 'register',
          icon: <UserAddOutlined />,
          label: "S'inscrire",
          onClick: () => { navigate('/register'); },
        },
      ];

  // Home always first
  const homeMenu = [{
    key: 'home',
    icon: <HomeOutlined />,
    label: 'Accueil',
    onClick: () => { navigate('/'); setDrawerOpen(false); }
  }];

  // In mobile, combine everything in the Drawer (including profile/logout only in mobile)
  const mobileMenuItems = [
    ...homeMenu,
    ...dashboardMenuItems,
    ...(user
      ? [
          {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profil',
            onClick: () => { navigate('/profile'); setDrawerOpen(false); },
          },
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Se déconnecter',
            onClick: async () => { await logout(); navigate('/'); setDrawerOpen(false); },
          },
        ]
      : [
          {
            key: 'login',
            icon: <LoginOutlined />,
            label: 'Se connecter',
            onClick: () => { navigate('/login'); setDrawerOpen(false); },
          },
          {
            key: 'register',
            icon: <UserAddOutlined />,
            label: "S'inscrire",
            onClick: () => { navigate('/register'); setDrawerOpen(false); },
          },
        ]),
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1101,
        height: 64,
        boxShadow: '0 2px 8px #0001',
      }}
    >
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 10 }}
        onClick={() => navigate('/')}
      >
        <img src={logo} alt="MedSafe" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        <span style={{ fontSize: 22, fontWeight: 700, color: '#1890ff' }}>MedSafe</span>
      </div>

      {/* Menu button on mobile, user menu on desktop */}
      {isMobile ? (
        <>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{ fontSize: 24, color: '#1890ff' }}
          />
          <Drawer
            title="Menu"
            placement="left"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={240}
            bodyStyle={{ padding: 0 }}
          >
            <Menu
              mode="vertical"
              selectedKeys={[location.pathname]}
              items={mobileMenuItems.map(item => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
                onClick: item.onClick,
              }))}
            />
          </Drawer>
        </>
      ) : (
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={userMenuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: item.onClick,
          }))}
          style={{ border: 'none' }}
        />
      )}
    </Header>
  );
}