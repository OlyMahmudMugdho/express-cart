'use client';
import React from 'react';
import Link from 'next/link';
import { Layout, Menu, Button } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Header } = Layout;

export default function AppHeader() {
  const { user, logout } = useAuth();

  const menuItems = [
    { key: '/', label: <Link href="/">Home</Link> },
    { key: '/catalog', label: <Link href="/catalog">Catalog</Link> },
    { key: '/checkout', label: <Link href="/checkout">Checkout</Link> },
  ];

  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      background: '#fff', 
      padding: '0 48px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }}>
      <div style={{ color: '#1677ff', fontWeight: 800, fontSize: '1.2rem', marginRight: 48 }}>Express Cart</div>
      <Menu 
        mode="horizontal" 
        selectedKeys={[]} 
        items={menuItems} 
        style={{ flex: 1, borderBottom: 'none' }} 
      />
      
      {user ? (
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/user">
            <Button type="text">Profile</Button>
          </Link>
          <Button onClick={logout} danger>Logout</Button>
        </div>
      ) : (
        <Link href="/auth">
          <Button type="primary">Login / Register</Button>
        </Link>
      )}
    </Header>
  );
}
