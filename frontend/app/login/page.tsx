'use client';
import { BASE_URI } from '@/constants/api';

import React from 'react';
import { Layout, Form, Input, Button, Typography, message } from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title } = Typography;

export default function LoginPage() {
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      const res = await fetch(BASE_URI + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Login response data:', data); // Debug log
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          message.success('Logged in successfully');
          router.push('/');
        } else {
          message.error('Token not found in response');
        }
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Invalid credentials');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px 16px' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '32px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
          <Title level={2} style={{ textAlign: 'center' }}>Login</Title>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>Login</Button>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              Don't have an account? <Link href="/register">Register</Link>
            </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
}
