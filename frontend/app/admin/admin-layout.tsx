'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Space, Breadcrumb, theme, MenuProps, Divider, Drawer, Badge } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileVisible, setMobileMobileVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/products">Products</Link>,
    },
    {
      key: '/admin/categories',
      icon: <TagsOutlined />,
      label: <Link href="/admin/categories">Categories</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Users</Link>,
    },
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: <Link href="/admin/orders">Orders</Link>,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const breadcrumbItems = pathname.split('/').filter(i => i).map((item, index, array) => ({
    title: item.charAt(0).toUpperCase() + item.slice(1),
    href: '/' + array.slice(0, index + 1).join('/'),
  }));

  const SidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        height: '64px', 
        margin: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: 'all 0.2s'
      }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          background: '#1677ff', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: collapsed ? 0 : '12px',
          flexShrink: 0
        }}>
          <ShoppingCartOutlined style={{ color: '#fff', fontSize: '20px' }} />
        </div>
        {!collapsed && (
          <Title level={4} style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 800, whiteSpace: 'nowrap' }}>
            ExpressCart
          </Title>
        )}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        style={{ flex: 1, borderRight: 0, background: 'transparent' }}
      />

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Dropdown menu={{ items: userMenuItems }} placement="topRight" arrow>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            <Avatar style={{ backgroundColor: '#1677ff', flexShrink: 0 }} icon={<UserOutlined />} />
            {!collapsed && (
              <div style={{ marginLeft: '12px', overflow: 'hidden' }}>
                <Text strong style={{ color: '#fff', display: 'block', fontSize: '14px', lineHeight: '1.2' }}>Admin</Text>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>Super Admin</Text>
              </div>
            )}
          </div>
        </Dropdown>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="dark"
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#001529',
          zIndex: 100,
          boxShadow: '4px 0 24px 0 rgba(0,21,41,0.08)'
        }}
        className="desktop-sider"
      >
        {SidebarContent}
      </Sider>

      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileMobileVisible(false)}
        open={mobileVisible}
        width={260}
        styles={{ body: { padding: 0, background: '#001529' } }}
      >
        {SidebarContent}
      </Drawer>

      <Layout className="main-layout" style={{ transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          width: '100%',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
              className="desktop-trigger"
            />
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMobileVisible(true)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
              className="mobile-trigger"
            />
            <Breadcrumb items={breadcrumbItems} />
          </Space>
          
          <Space size={20}>
            <Badge count={5} dot>
              <Button type="text" icon={<BellOutlined />} style={{ fontSize: '18px' }} />
            </Badge>
          </Space>
        </Header>

        <Content style={{ margin: '24px 24px', minHeight: 280 }}>
          <div style={{ 
            minHeight: 'calc(100vh - 112px)'
          }}>
            {children}
          </div>
        </Content>
      </Layout>

      <style jsx global>{`
        .main-layout {
          margin-left: ${collapsed ? '80px' : '260px'};
        }
        
        @media (max-width: 992px) {
          .desktop-sider {
            display: none !important;
          }
          .desktop-trigger {
            display: none !important;
          }
          .mobile-trigger {
            display: block !important;
          }
          .main-layout {
            margin-left: 0 !important;
          }
        }
        
        @media (min-width: 993px) {
          .mobile-trigger {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}
