'use client';

import React from 'react';
import { Layout, Form, Input, Button, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { BASE_URI } from '@/constants/api';

const { Content } = Layout;
const { Title } = Typography;

export default function AdminLoginPage() {
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      const res = await fetch(`${BASE_URI}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      
      console.log('Login response data:', data);

      if (res.ok && (data.user.role.toLowerCase() === 'admin' || data.user.role.toLowerCase() === 'superadmin')) {
        localStorage.setItem('token', data.accessToken);
        message.success('Admin logged in');
        router.push('/admin');
      } else {
        message.error('Unauthorized: Not an admin');
      }
    } catch (e) {
      console.error('Login error:', e);
      message.error('An error occurred');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Content style={{ width: '400px', padding: '32px', background: '#fff', borderRadius: '8px' }}>
        <Title level={3} style={{ textAlign: 'center' }}>Admin Login</Title>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Login</Button>
        </Form>
      </Content>
    </Layout>
  );
}
