import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Typography, Avatar, Dropdown, Space } from 'antd';
import {
  MenuOutlined,
  LogoutOutlined,
  UserAddOutlined,
  LoginOutlined,
  HomeOutlined,
  UserOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import logo from '../assets/images/MedSafe.png';
import { menuItemsByRole } from '../config/menuItems';

const { Header } = Layout;
const { Text } = Typography;

// Fresh blue color palette
const colors = {
  primary: '#2B7DE0',     // Vibrant blue
  primary2: '#4F9BE2',    // Lighter complementary blue
  accent: '#7ADEFF',      // Fresh sky blue accent
  light: '#E0F7FF',       // Very light airy blue
  textOnPrimary: '#ffffff',
};

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentDateTime, setCurrentDateTime] = useState('2025-06-20 22:43:46');
  
  // Store user information in state to ensure it persists
  const [userName, setUserName] = useState(() => {
    // Try to get from localStorage first (for persistence across refreshes)
    const storedUser = localStorage.getItem('medsafe_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.name || parsedUser.username || 'User Name';
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    // Fall back to props
    return user?.name || user?.username || 'User Name';
  });
  
  // Update userName whenever user changes
  useEffect(() => {
    if (user?.name || user?.username) {
      setUserName(user.name || user.username);
      // Also store in localStorage for persistence
      try {
        localStorage.setItem('medsafe_user', JSON.stringify(user));
      } catch (e) {
        console.error('Error storing user data:', e);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    // Update time every minute
    const timer = setInterval(() => {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
      setCurrentDateTime(formattedDate);
    }, 60000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);

  // Dashboard menu
  /* const dashboardMenuItems = user
    ? menuItemsByRole
        .filter(item => item.roles.includes(user.role))
        .map(item => ({
          key: item.to,
          icon: item.icon,
          label: item.label,
          onClick: () => { navigate(item.to); setDrawerOpen(false); }
        }))
    : []; */

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
          onClick: async () => { 
            await logout(); 
            navigate('/');
            // Clear localStorage on logout
            localStorage.removeItem('medsafe_user');
            setUserName('Username');
          },
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
    //...dashboardMenuItems,
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
            onClick: async () => { 
              await logout(); 
              navigate('/'); 
              setDrawerOpen(false);
              // Clear localStorage on logout
              localStorage.removeItem('medsafe_user');
              setUserName('Username');
            },
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
        background: `linear-gradient(135deg, ${colors.light} 0%, white 100%)`,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1101,
        height: 64,
        boxShadow: '0 2px 10px rgba(43, 125, 224, 0.1)',
        borderBottom: `2px solid ${colors.accent}`,
      }}
    >
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary2} 100%)`,
          padding: '6px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(43, 125, 224, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img 
            src={logo} 
            alt="MedSafe" 
            style={{ 
              width: 32, 
              height: 32, 
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',  // Make logo white
            }} 
          />
        </div>
        <div style={{ marginLeft: 12 }}>
          <Text 
            style={{ 
              fontSize: 22, 
              fontWeight: 700, 
              color: colors.primary,
              margin: 0,
              lineHeight: 1.2,
              display: 'block',
            }}
          >
            MedSafe
          </Text>
          {!isMobile && (
            <Text 
              style={{ 
                fontSize: 11, 
                color: colors.primary2,
                opacity: 0.8,
                display: 'block',
              }}
            >
              {currentDateTime}
            </Text>
          )}
        </div>
      </div>

      {/* Menu button on mobile, user menu on desktop */}
      {isMobile ? (
        <>
          <Button
            type="primary"
            shape="circle"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{ 
              background: colors.primary,
              borderColor: colors.primary,
              boxShadow: '0 2px 5px rgba(43, 125, 224, 0.2)',
            }}
          />
          <Drawer
            title={
              <Space>
                <div style={{
                  background: colors.primary,
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img 
                    src={logo} 
                    alt="MedSafe" 
                    style={{ 
                      width: 20, 
                      height: 20, 
                      objectFit: 'contain',
                      filter: 'brightness(0) invert(1)',  // Make logo white
                    }} 
                  />
                </div>
                <span style={{ color: colors.primary, fontWeight: 'bold' }}>MedSafe</span>
              </Space>
            }
            placement="left"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={280}
            bodyStyle={{ padding: 0 }}
          >
            {user && (
              <div style={{
                padding: '16px',
                background: colors.light,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid #f0f0f0',
              }}>
                <Avatar 
                  size={42} 
                  icon={<UserOutlined />} 
                  style={{ 
                    background: colors.primary,
                    color: '#fff',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {/* Use userName state instead of directly referencing user */}
                    {userName}
                  </div>
                  <div style={{ color: colors.primary2, fontSize: '12px' }}>
                    {user.role || 'Utilisateur'}
                  </div>
                </div>
              </div>
            )}
            <Menu
              mode="vertical"
              selectedKeys={[location.pathname]}
              items={mobileMenuItems}
              style={{
                borderRight: 'none',
              }}
            />
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {currentDateTime}
              </Text>
            </div>
          </Drawer>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Desktop Navigation Menu */}
{/*           <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={homeMenu.concat(dashboardMenuItems)}
            style={{ 
              border: 'none', 
              background: 'transparent',
              marginRight: 24,
            }}
          /> */}

          {/* User Menu */}
          {user ? (
            <Dropdown
              menu={{ 
                items: userMenuItems,
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                style={{
                  background: colors.primary,
                  borderColor: colors.primary,
                  boxShadow: '0 2px 5px rgba(43, 125, 224, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 12px 4px 4px',
                  height: 'auto',
                }}
                type="primary"
              >
                <Space>
                  <Avatar 
                    size={28} 
                    icon={<UserOutlined />}
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.2)', 
                      color: '#fff',
                    }} 
                  />
                  {/* Use userName state instead of directly referencing user */}
                  <span>{userName}</span>
                  <CaretDownOutlined />
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Space>
              <Button 
                icon={<LoginOutlined />} 
                onClick={() => navigate('/login')}
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                }}
              >
                Se connecter
              </Button>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={() => navigate('/register')}
                style={{
                  background: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                S'inscrire
              </Button>
            </Space>
          )}
        </div>
      )}
    </Header>
  );
}