'use client';
import { BASE_URI } from '@/constants/api';

import React, { useEffect, useState } from 'react';
import { Layout, Button, Typography, message, Spin, Tabs, Table, List, Descriptions } from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const { Content } = Layout;
const { Title } = Typography;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      try {
        const [profRes, orderRes, cartRes] = await Promise.all([
          fetch(BASE_URI + '/users/profile', { headers }),
          fetch(BASE_URI + '/checkout/orders', { headers }),
          fetch(BASE_URI + '/cart', { headers })
        ]);
        
        const profData = await profRes.json();
        const orderData = await orderRes.json();
        const cartData = await cartRes.json();
        
        setProfile(profData);
        setOrders(Array.isArray(orderData) ? orderData : []);
        setCart(cartData.items || []);
      } catch (e) {
        console.error(e);
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <List dataSource={cart} renderItem={item => <List.Item>{item.product?.name} - ${item.price} (Qty: {item.quantity})</List.Item>} />
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
