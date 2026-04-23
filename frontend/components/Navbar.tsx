'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Input, 
  Button, 
  Space, 
  Drawer, 
  List, 
  Typography, 
  Divider, 
  Badge, 
  message, 
  Empty, 
  Avatar, 
  Dropdown 
} from 'antd';
import { 
  ShoppingCart, 
  Menu as MenuIcon, 
  Trash2, 
  Search, 
  User, 
  LogOut, 
  Settings, 
  X,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();

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

    const handleCartUpdate = () => {
      fetchCart();
      setIsCartOpen(true);
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
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

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link href="/profile">My Workspace</Link>,
      icon: <User size={14} />
    },
    ...(isAdmin ? [{
      key: 'admin',
      label: <Link href="/admin">Admin Control</Link>,
      icon: <Settings size={14} />
    }] : []),
    { type: 'divider' },
    {
      key: 'logout',
      label: <span onClick={handleLogout}>Sign Out</span>,
      icon: <LogOut size={14} />,
      danger: true
    }
  ];

  return (
    <Header className="glass-morphism" style={{ 
      background: 'rgba(255, 255, 255, 0.8)', 
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #f1f5f9', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: isMobile ? '0 16px' : '0 40px', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000,
      height: '72px',
      transition: 'all 0.3s ease'
    }}>
      <Link href="/" style={{ 
        fontSize: '24px', 
        fontWeight: 800, 
        color: '#0f172a', 
        letterSpacing: '-0.03em',
        display: 'flex',
        alignItems: 'center'
      }}>
        ExpressCart
      </Link>

      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Space size={32}>
            <Link href="/products" style={{ color: pathname === '/products' ? '#1677ff' : '#64748b', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }}>Collections</Link>
            <Link href="/products" style={{ color: '#64748b', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }}>New Arrivals</Link>
            {isAdmin && <Link href="/admin" style={{ color: '#f5222d', fontWeight: 700, fontSize: '14px' }}>Admin</Link>}
          </Space>
        </div>
      )}

      <Space size={isMobile ? "small" : "large"}>
        {!isMobile && (
          <Input 
            placeholder="Search collections..." 
            onPressEnter={(e: any) => onSearch(e.target.value)}
            prefix={<Search size={16} style={{ color: '#94a3b8' }} />}
            style={{ width: '240px', borderRadius: '4px', border: '1px solid #f1f5f9', background: '#f8fafc' }}
          />
        )}
        
        <Badge count={cart.length} offset={[2, 0]} size="small" color="#1677ff">
          <Button 
            icon={<ShoppingCart size={22} />} 
            type="text" 
            onClick={() => setIsCartOpen(true)} 
            style={{ color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Badge>

        {isAuthed ? (
          <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" arrow>
            <Avatar 
              size={36} 
              style={{ background: '#f1f5f9', color: '#1677ff', cursor: 'pointer', border: '1px solid #e2e8f0' }} 
              icon={<User size={18} />} 
            />
          </Dropdown>
        ) : (
          !isMobile && (
            <Space size="middle">
              <Link href="/login" style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Sign In</Link>
              <Button 
                type="primary" 
                className="btn-elegant"
                onClick={() => router.push('/register')}
                style={{ borderRadius: '4px', height: '40px', fontWeight: 600 }}
              >
                Join Now
              </Button>
            </Space>
          )
        )}

        {isMobile && (
          <Button 
            icon={<MenuIcon size={24} />} 
            onClick={() => setIsDrawerOpen(true)} 
            type="text" 
            style={{ color: '#1e293b' }}
          />
        )}
      </Space>

      {/* Navigation Drawer (Mobile) */}
      <Drawer 
        title={<div style={{ fontSize: '20px', fontWeight: 800 }}>Menu</div>} 
        placement="right" 
        onClose={() => setIsDrawerOpen(false)} 
        open={isDrawerOpen} 
        width="100%"
        closeIcon={<X size={24} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 8px' }}>
          <div style={{ marginBottom: '40px' }}>
            <Input 
              placeholder="Search products..." 
              size="large"
              onPressEnter={(e: any) => { onSearch(e.target.value); setIsDrawerOpen(false); }}
              prefix={<Search size={20} style={{ color: '#94a3b8' }} />}
              style={{ borderRadius: '8px', background: '#f8fafc', border: 'none' }}
            />
          </div>

          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <Link href="/products" onClick={() => setIsDrawerOpen(false)} style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
              Shop Collections <ChevronRight size={18} />
            </Link>
            <Link href="/products" onClick={() => setIsDrawerOpen(false)} style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
              New Arrivals <ChevronRight size={18} />
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setIsDrawerOpen(false)} style={{ fontSize: '18px', fontWeight: 700, color: '#f5222d', display: 'flex', justifyContent: 'space-between' }}>
                Admin Control <ChevronRight size={18} />
              </Link>
            )}
          </Space>

          <Divider style={{ margin: '40px 0' }} />

          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {isAuthed ? (
              <>
                <Link href="/profile" onClick={() => setIsDrawerOpen(false)} style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Account Dashboard</Link>
                <Text style={{ fontSize: '18px', fontWeight: 600, color: '#f5222d' }} onClick={handleLogout}>Sign Out</Text>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsDrawerOpen(false)} style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Sign In</Link>
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  onClick={() => { router.push('/register'); setIsDrawerOpen(false); }}
                  style={{ height: '56px', borderRadius: '8px', fontWeight: 600 }}
                >
                  Create Account
                </Button>
              </>
            )}
          </Space>
        </div>
      </Drawer>

      {/* Cart Sidebar */}
      <Drawer 
        title={<Title level={4} style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Your Collection</Title>} 
        placement="right" 
        onClose={() => setIsCartOpen(false)} 
        open={isCartOpen} 
        width={isMobile ? '100%' : 420}
        closeIcon={<X size={24} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={cart}
                renderItem={(item) => (
                  <List.Item
                    style={{ padding: '20px 0' }}
                    actions={[
                      <Button 
                        type="text" 
                        danger 
                        icon={<Trash2 size={18} />} 
                        onClick={() => removeFromCart(item.id)} 
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px' }} />}
                      title={<Text strong style={{ fontSize: '15px' }}>{item.product?.name}</Text>}
                      description={
                        <Space direction="vertical" size={2}>
                          <Text type="secondary" style={{ fontSize: '13px' }}>Quantity: {item.quantity}</Text>
                          <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>${(Number(item.price) * item.quantity).toFixed(2)}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ marginTop: '100px', textAlign: 'center' }}>
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={<Text type="secondary" style={{ fontSize: '16px' }}>Your cart is currently empty</Text>} 
                />
                <Button 
                  type="primary" 
                  ghost 
                  onClick={() => { setIsCartOpen(false); router.push('/products'); }}
                  style={{ marginTop: '24px', borderRadius: '4px' }}
                >
                  Start Shopping
                </Button>
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
            <div style={{ paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'baseline' }}>
                <Text style={{ fontSize: '16px', color: '#64748b' }}>Estimated Total:</Text>
                <Text strong style={{ fontSize: '28px', color: '#0f172a' }}>${cartTotal.toFixed(2)}</Text>
              </div>
              <Button 
                type="primary" 
                size="large" 
                block 
                className="btn-elegant"
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/checkout');
                }}
                style={{ height: '56px', borderRadius: '4px', fontSize: '16px', fontWeight: 600 }}
              >
                Proceed to Checkout
              </Button>
              <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block', marginTop: '16px' }}>
                Complimentary shipping on all orders over $100
              </Text>
            </div>
          )}
        </div>
      </Drawer>
    </Header>
  );
}
