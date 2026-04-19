'use client';
import React from 'react';
import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { AppstoreOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { key: '/admin/dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: '/admin/products', icon: <AppstoreOutlined />, label: 'Products' },
    { key: '/admin/rbac', icon: <SettingOutlined />, label: 'RBAC' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ color: '#fff', padding: 16, fontWeight: 'bold' }}>Express Cart Admin</div>
        <Menu 
          theme="dark" 
          selectedKeys={[pathname]} 
          items={items} 
          onClick={({ key }) => router.push(key)} 
        />
      </Sider>
      <Content style={{ padding: 24 }}>{children}</Content>
    </Layout>
  );
}
