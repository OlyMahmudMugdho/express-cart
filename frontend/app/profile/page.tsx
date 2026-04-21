'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Typography, message, Spin, Tabs, Table, List, Descriptions, InputNumber, Modal } from 'antd';
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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm] = Form.useForm();

  const fetchCart = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const res = await fetch('http://localhost:3000/cart', { headers });
    const data = await res.json();
    setCart(data.items || []);
  };

  const fetchAddresses = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const res = await fetch('http://localhost:3000/users/addresses', { headers });
    const data = await res.json();
    setAddresses(data || []);
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
        await fetchAddresses();
      } catch (e) {
        console.error(e);
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [form]);

  const addAddress = async (values: any) => {
    try {
      const res = await fetch('http://localhost:3000/users/addresses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        message.success('Address added');
        setIsAddressModalOpen(false);
        addressForm.resetFields();
        fetchAddresses();
      } else {
        message.error('Failed to add address');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/users/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        message.success('Address deleted');
        fetchAddresses();
      } else {
        message.error('Failed to delete address');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

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
    {
      key: '4',
      label: 'Addresses',
      children: (
        <>
          <Table dataSource={addresses} columns={[
              { title: 'Label', dataIndex: 'label', key: 'label' },
              { title: 'Street', dataIndex: 'street', key: 'street' },
              { title: 'City', dataIndex: 'city', key: 'city' },
              { title: 'State', dataIndex: 'state', key: 'state' },
              { title: 'Country', dataIndex: 'country', key: 'country' },
              { 
                title: 'Action', 
                key: 'action', 
                render: (_, record: any) => (
                  <Button danger onClick={() => deleteAddress(record.id)}>Delete</Button>
                )
              }
          ]} rowKey="id" />
          <Button type="dashed" onClick={() => setIsAddressModalOpen(true)} style={{ marginTop: '16px', width: '100%' }}>
            Add New Address
          </Button>

          <Modal 
            title="Add New Address" 
            open={isAddressModalOpen} 
            onCancel={() => setIsAddressModalOpen(false)}
            onOk={() => addressForm.submit()}
          >
            <Form form={addressForm} layout="vertical" onFinish={addAddress}>
              <Form.Item name="label" label="Label (e.g. Home, Office)" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="street" label="Street" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="city" label="City" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="state" label="State" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="country" label="Country" rules={[{ required: true }]}><Input /></Form.Item>
            </Form>
          </Modal>
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
