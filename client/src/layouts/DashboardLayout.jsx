// client/src/layouts/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined
} from '@ant-design/icons';
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
      icon:item.icon,
      label: item.label
    }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Top Header */}
      <Header />

      <Layout>
        {/* Sidebar on desktop, Drawer on mobile */}
        {isMobile ? (
          <Drawer
            title="Menu"
            placement="left"
            onClose={() => setCollapsed(true)}
            open={!collapsed}
            styles={{ body: { padding: '16px' } }}
          >
            <Menu
              mode="inline"
              items={items}
              onClick={({ key }) => { navigate(key); setCollapsed(true); }}
            />
          </Drawer>
        ) : (
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
          {/* Collapse button for mobile */}
          {isMobile && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ position: 'absolute', top: 64, left: 10, zIndex: 1000 }}
            />
          )}

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
