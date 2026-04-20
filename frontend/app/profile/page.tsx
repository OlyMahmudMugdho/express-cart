'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Typography, message, Spin, Tabs, Table, List, Descriptions, InputNumber } from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const { Content } = Layout;
const { Title } = Typography;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const fetchCart = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const res = await fetch('http://localhost:3000/cart', { headers });
    const data = await res.json();
    setCart(data.items || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      try {
        const [profRes, orderRes] = await Promise.all([
          fetch('http://localhost:3000/users/profile', { headers }),
          fetch('http://localhost:3000/checkout/orders', { headers })
        ]);
        
        const profData = await profRes.json();
        const orderData = await orderRes.json();
        
        setProfile(profData);
        form.setFieldsValue(profData);
        setOrders(Array.isArray(orderData) ? orderData : []);
        await fetchCart();
      } catch (e) {
        console.error(e);
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [form]);

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`http://localhost:3000/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        message.success('Cart updated');
        fetchCart();
      } else {
        message.error('Failed to update cart');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        message.success('Item removed');
        fetchCart();
      } else {
        message.error('Failed to remove item');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  const onFinish = async (values: any) => {
    const res = await fetch('http://localhost:3000/users/profile', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success('Profile updated');
    } else {
      message.error('Failed to update profile');
    }
  };

  if (loading) return <Spin fullscreen />;

  const items = [
    {
      key: '1',
      label: 'Profile Info',
      children: (
        <>
          <Descriptions bordered column={1} style={{ marginBottom: '24px' }}>
            <Descriptions.Item label="First Name">{profile?.firstName}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{profile?.lastName}</Descriptions.Item>
            <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{profile?.phone}</Descriptions.Item>
          </Descriptions>
          <Link href="/profile/edit">
            <Button type="primary">Edit Profile</Button>
          </Link>
        </>
      ),
    },
    {
      key: '2',
      label: 'Order History',
      children: (
        <Table dataSource={orders} columns={[
            { title: 'Order ID', dataIndex: 'orderNumber', key: 'orderNumber' },
            { title: 'Total', dataIndex: 'total', key: 'total' },
            { title: 'Status', dataIndex: 'status', key: 'status' }
        ]} rowKey="id" />
      ),
    },
    {
      key: '3',
      label: 'Cart',
      children: (
        <>
          <Table dataSource={cart} columns={[
            { title: 'Product', dataIndex: ['product', 'name'], key: 'name' },
            { title: 'Price', dataIndex: 'price', key: 'price' },
            { 
              title: 'Quantity', 
              dataIndex: 'quantity', 
              key: 'quantity', 
              render: (quantity, record: any) => (
                <InputNumber 
                  min={1} 
                  defaultValue={quantity} 
                  onBlur={(e) => updateCartItem(record.id, parseInt(e.target.value))} 
                />
              )
            },
            { 
              title: 'Action', 
              key: 'action', 
              render: (_, record: any) => (
                <Button danger onClick={() => removeCartItem(record.id)}>Remove</Button>
              )
            }
          ]} rowKey="id" />
          <Link href="/checkout">
              <Button type="primary" size="large" style={{ marginTop: '16px' }}>Proceed to Checkout</Button>
          </Link>
        </>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Content style={{ padding: '24px 16px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <Title level={2}>Dashboard</Title>
        <Tabs defaultActiveKey="1" items={items} />
      </Content>
    </Layout>
  );
}
