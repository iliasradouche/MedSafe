import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Divider, Avatar, Badge, Tooltip } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { menuItemsByRole } from '../config/menuItems';
import Header from '../components/Header';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Sider, Content, Footer } = Layout;
const { Text, Title } = Typography;

export default function DashboardLayout() {
  const { user } = useAuth();
 
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  const formatUTCDateTime = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
  const [currentDateTime, setCurrentDateTime] = useState(formatUTCDateTime());
  // Fresh blue color palette
  const colors = {
    primary: '#2B7DE0',     // Vibrant blue
    primary2: '#4F9BE2',    // Lighter complementary blue
    accent: '#7ADEFF',      // Fresh sky blue accent
    light: '#E0F7FF',       // Very light airy blue
    textOnPrimary: '#ffffff',
    background: '#F7FCFF',  // Almost white with hint of blue
    siderBackground: '#FFFFFF', // White for sider
    menuHover: '#F5F7FC',   // Very light blue for hover
    menuActive: '#E0F7FF',  // Light blue for active items
    borderColor: '#E3ECF5', // Light border color
    textPrimary: '#1A2B4A',  // Dark blue for text
    textSecondary: '#8C9CB0' // Grey for secondary text
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const items = menuItemsByRole
    .filter(item => item.roles.includes(user.role))
    .map(item => ({
      key: item.to,
      icon: React.cloneElement(item.icon, { style: { fontSize: '18px', color: colors.primary } }),
      label: item.label
    }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Top Header */}
      <Header />

      <Layout>
        {/* Sidebar only on desktop */}
        {!isMobile && (
          <Sider 
            collapsible 
            collapsed={collapsed} 
            onCollapse={setCollapsed}
            width={260}
            style={{
              background: colors.siderBackground,
              borderRight: `1px solid ${colors.borderColor}`,
              overflow: 'auto',
              height: '100vh',
              position: 'sticky',
              top: 64, // Header height
              left: 0,
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.03)',
              zIndex: 10
            }}
            theme="light"
          >
            {/* User Profile Section - only visible when not collapsed */}
            {!collapsed && (
              <div style={{
                padding: '20px 16px',
                borderBottom: `1px solid ${colors.borderColor}`,
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <Avatar 
                    size={42} 
                    icon={<UserOutlined />} 
                    style={{ 
                      background: colors.primary,
                      color: colors.textOnPrimary,
                    }}
                  />
                  <div>
                    <Text style={{ 
  fontSize: '15px', 
  fontWeight: 'bold',
  color: colors.textPrimary,
  display: 'block',
  lineHeight: 1.3
}}>
  {user.name || user.username || user.email || 'Utilisateur'}
</Text>
                    <Text style={{ 
                      fontSize: '12px', 
                      color: colors.textSecondary,
                      display: 'block',
                      lineHeight: 1.3
                    }}>
                      {user.role || 'Utilisateur'}
                    </Text>
                  </div>
                </div>
                
                <Tooltip title="Date et heure actuelles (UTC)">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    background: colors.light,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: colors.primary
                  }}>
                    <Badge status="processing" color={colors.primary} />
                    <ClockCircleOutlined style={{ fontSize: '12px' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentDateTime}
                    </span>
                  </div>
                </Tooltip>
              </div>
            )}
            
            {/* Menu Section */}
            <div style={{ padding: collapsed ? '8px 0' : '16px 0' }}>
              {!collapsed && (
                <Text style={{ 
                  padding: '0 24px', 
                  color: colors.textSecondary,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Menu
                </Text>
              )}
              
              <Menu
                theme="light"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={items}
                onClick={({ key }) => navigate(key)}
                style={{
                  border: 'none',
                  background: 'transparent'
                }}
              />
            </div>
            
            {/* Footer information - only visible when not collapsed */}
            {!collapsed && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                padding: '16px',
                borderTop: `1px solid ${colors.borderColor}`,
                background: colors.siderBackground,
                fontSize: '11px',
                color: colors.textSecondary,
                textAlign: 'center'
              }}>
                <Text style={{ display: 'block', fontSize: '11px', color: colors.textSecondary }}>
                  MedSafe Dashboard v2.0
                </Text>
                <Text style={{ display: 'block', fontSize: '11px', color: colors.textSecondary, marginTop: '4px' }}>
                  © 2025 Gestion des Patients
                </Text>
              </div>
            )}
          </Sider>
        )}

        <Layout style={{ background: colors.background }}>
          <Content style={{ 
            margin: '24px 16px', 
            padding: 24, 
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <Outlet />
          </Content>

          <Footer style={{ 
  textAlign: 'center',
  background: 'transparent',
  color: colors.textSecondary
}}>
  ©2025 Gestions des Patients • {currentDateTime} • {user.username || user.email || 'Utilisateur'}
</Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}