import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Typography } from 'antd';
import {
  MenuOutlined,
  LogoutOutlined,
  UserAddOutlined,
  LoginOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import logo from '../assets/images/MedSafe.png';
const { Header } = Layout;
const { Title } = Typography;

export default function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAuth = async () => {
    if (user) {
      await logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const menuItems = user
    ? [
      {
        key: 'home',
        label: 'Accueil',
        icon: <HomeOutlined />,
        onClick: () => navigate('/'),
      },
      {
        key: 'profile',
        label: 'Profil',
        icon: <UserOutlined />,
        onClick: () => navigate('/profile'),
      },
      {
        key: 'logout',
        label: 'Se déconnecter',
        icon: <LogoutOutlined />,
        onClick: handleAuth,
      },
    ]
    : [
      {
        key: 'home',
        label: 'Accueil',
        icon: <HomeOutlined />,
        onClick: () => navigate('/'),
      },
      {
        key: 'login',
        label: 'Se connecter',
        icon: <LoginOutlined />,
        onClick: () => navigate('/login'),
      },
      {
        key: 'register',
        label: "S'inscrire",
        icon: <UserAddOutlined />,
        onClick: () => navigate('/register'),
      },
    ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo Section */}
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img src={logo} alt="MedSafe" style={{ width: '150px', height: '150px', objectFit: 'contain', marginRight: '10px' }} />
      </div>

      {/* Navigation Menu */}
      {isMobile ? (
        <>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMenuVisible(true)}
            style={{ fontSize: '20px', color: '#1890ff' }}
          />
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setMenuVisible(false)}
            open={menuVisible}
          >
            <Menu
              mode="vertical"
              items={menuItems.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
                onClick: () => {
                  item.onClick();
                  setMenuVisible(false);
                },
              }))}
            />
          </Drawer>
        </>
      ) : (
        <Menu
          mode="horizontal"
          items={menuItems.map((item) => ({
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