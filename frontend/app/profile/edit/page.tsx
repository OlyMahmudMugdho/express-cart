'use client';
import { BASE_URI } from '@/constants/api';

import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Typography, message, Spin } from 'antd';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title } = Typography;

export default function EditProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URI}/users/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        form.setFieldsValue(data);
        setLoading(false);
      });
  }, [form]);

  const onFinish = async (values: any) => {
    const res = await fetch(`${BASE_URI}/users/profile`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success('Profile updated');
      router.push('/profile');
    } else {
      message.error('Failed to update profile');
    }
  };

  if (loading) return <Spin fullscreen />;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Content style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <Title level={2}>Edit Profile</Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="firstName" label="First Name"><Input /></Form.Item>
          <Form.Item name="lastName" label="Last Name"><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Button type="primary" htmlType="submit">Save Changes</Button>
        </Form>
      </Content>
    </Layout>
  );
}
