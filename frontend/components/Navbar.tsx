'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Button, Space, Drawer, List, Typography, Divider, Badge, message, Empty } from 'antd';
import { ShoppingCartOutlined, MenuOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BASE_URI } from '@/constants/api';

const { Header } = Layout;
const { Text, Title } = Typography;

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthed(!!token);
    
    if (token && typeof window !== 'undefined') {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        const role = payload.role?.toLowerCase();
        setIsAdmin(role === 'admin' || role === 'superadmin');
      } catch (e) {
        console.error('Error decoding token:', e);
        setIsAdmin(false);
      }
      fetchCart();
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URI}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.items || []);
      }
    } catch (e) {
      console.error('Fetch cart error:', e);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_URI}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        message.success('Item removed');
        fetchCart();
      }
    } catch (e) {
      message.error('Failed to remove item');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthed(false);
    window.location.href = '/';
  };

  const onSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/products?search=${encodeURIComponent(value.trim())}`);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  return (
    <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 1000 }}>
      <Link href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#1677ff', letterSpacing: '-0.5px' }}>ExpressCart</Link>

      {isMobile ? (
        <Space size="small">
          <Input.Search 
            placeholder="Search" 
            onSearch={onSearch}
            style={{ width: '120px' }} 
          />
          <Badge count={cart.length} size="small">
            <Button icon={<ShoppingCartOutlined />} type="text" onClick={() => setIsCartOpen(true)} />
          </Badge>
          <Button icon={<MenuOutlined />} onClick={() => setIsDrawerOpen(true)} type="text" />
        </Space>
      ) : (
        <>
          <Menu 
            mode="horizontal" 
            style={{ flex: 1, border: 'none', justifyContent: 'center' }} 
            items={[
              { key: 'shop', label: <Link href="/products">Shop</Link> }, 
              ...(isAdmin ? [{ key: 'admin', label: <Link href="/admin" style={{ color: '#f5222d', fontWeight: 'bold' }}>Admin Panel</Link> }] : [])
            ]} 
          />
          <Space size="middle">
            <Input.Search 
              placeholder="Search products..." 
              onSearch={onSearch}
              style={{ width: '250px' }} 
            />
            <Badge count={cart.length} offset={[5, 0]}>
              <Button icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />} type="text" onClick={() => setIsCartOpen(true)} />
            </Badge>
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

      {/* Navigation Drawer (Mobile) */}
      <Drawer title="Menu" placement="right" onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen} width={250}>
        <Menu mode="vertical" onClick={() => setIsDrawerOpen(false)} items={[
          { key: 'shop', label: <Link href="/products">Shop</Link> },
          ...(isAdmin ? [{ key: 'admin', label: <Link href="/admin" style={{ color: '#f5222d', fontWeight: 'bold' }}>Admin Panel</Link> }] : []),
          ...(isAuthed 
              ? [{ key: 'profile', label: <Link href="/profile">Profile</Link> }, { key: 'logout', label: <span onClick={handleLogout}>Logout</span> }]
              : [{ key: 'login', label: <Link href="/login">Login</Link> }, { key: 'register', label: <Link href="/register">Register</Link> }]
          )
        ]} />
      </Drawer>

      {/* Cart Sidebar */}
      <Drawer 
        title={<Title level={4} style={{ margin: 0 }}>Your Cart</Title>} 
        placement="right" 
        onClose={() => setIsCartOpen(false)} 
        open={isCartOpen} 
        width={isMobile ? '100%' : 400}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={cart}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => removeFromCart(item.id)} 
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                      title={item.product?.name}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{item.quantity} x ${Number(item.price).toFixed(2)}</Text>
                          <Text strong>${(Number(item.price) * item.quantity).toFixed(2)}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Your cart is empty" style={{ marginTop: 100 }} />
            )}
          </div>
          
          {cart.length > 0 && (
            <div style={{ paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 16 }}>Total Amount:</Text>
                <Text strong style={{ fontSize: 20 }}>${cartTotal.toFixed(2)}</Text>
              </div>
              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/checkout');
                }}
              >
                Checkout Now
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </Header>
  );
}
