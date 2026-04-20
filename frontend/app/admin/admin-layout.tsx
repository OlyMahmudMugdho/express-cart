'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import Link from 'next/link';

const { Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ padding: '16px', color: '#fff', fontSize: '18px', textAlign: 'center' }}>Admin Portal</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['products']}>
          <Menu.Item key="products"><Link href="/admin/products">Products</Link></Menu.Item>
          <Menu.Item key="categories"><Link href="/admin/categories">Categories</Link></Menu.Item>
          <Menu.Item key="users"><Link href="/admin/users">Users</Link></Menu.Item>
          <Menu.Item key="orders"><Link href="/admin/orders">Orders</Link></Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ padding: '24px' }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
