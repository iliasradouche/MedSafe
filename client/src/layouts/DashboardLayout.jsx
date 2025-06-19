import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { menuItemsByRole } from '../config/menuItems';
import Header from '../components/Header'; // your shared header

const { Sider, Content, Footer } = Layout;

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const items = menuItemsByRole
    .filter(item => item.roles.includes(user.role))
    .map(item => ({
      key: item.to,
      icon: item.icon,
      label: item.label
    }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Top Header */}
      <Header />

      <Layout>
        {/* Sidebar only on desktop */}
        {!isMobile && (
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
            <Menu
              theme="light"
              mode="inline"
              items={items}
              onClick={({ key }) => navigate(key)}
            />
          </Sider>
        )}

        <Layout>
          {/* No more Drawer or mobile collapse button here! */}

          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            <Outlet />
          </Content>

          <Footer style={{ textAlign: 'center' }}>
            ©2025 Gestions des Patients
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}