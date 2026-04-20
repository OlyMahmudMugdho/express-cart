'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Button, Space, Drawer } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Header } = Layout;

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(!!localStorage.getItem('token'));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthed(false);
    window.location.href = '/';
  };

  return (
    <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 1000 }}>
      <Link href="/" style={{ fontSize: '18px', fontWeight: 'bold', color: '#1677ff' }}>ExpressCart</Link>

      {isMobile ? (
        <Space size="small">
          <Input placeholder="Search" prefix={<SearchOutlined />} style={{ width: '80px' }} />
          <Button icon={<ShoppingCartOutlined />} type="text" />
          <Button icon={<MenuOutlined />} onClick={() => setIsDrawerOpen(true)} type="text" />
        </Space>
      ) : (
        <>
          <Menu mode="horizontal" style={{ flex: 1, border: 'none', justifyContent: 'center' }} items={[{ key: 'shop', label: <Link href="/products">Shop</Link> }, { key: 'deals', label: 'Deals' }]} />
          <Space size="small">
            <Input placeholder="Search" prefix={<SearchOutlined />} style={{ width: '150px' }} />
            <Button icon={<ShoppingCartOutlined />} type="text" />
            {isAuthed ? (
              <>
                <Link href="/profile"><Button type="primary">Profile</Button></Link>
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button type="primary">Login</Button></Link>
                <Link href="/register"><Button>Register</Button></Link>
              </>
            )}
          </Space>
        </>
      )}

      {isMobile && (
        <Drawer title="Menu" placement="right" onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen} width={250}>
          <Menu mode="vertical" onClick={() => setIsDrawerOpen(false)} items={[
            { key: 'shop', label: <Link href="/products">Shop</Link> },
            { key: 'deals', label: 'Deals' },
            ...(isAuthed 
                ? [{ key: 'profile', label: <Link href="/profile">Profile</Link> }, { key: 'logout', label: <span onClick={handleLogout}>Logout</span> }]
                : [{ key: 'login', label: <Link href="/login">Login</Link> }, { key: 'register', label: <Link href="/register">Register</Link> }]
            )
          ]} />
        </Drawer>
      )}
    </Header>
  );
}
