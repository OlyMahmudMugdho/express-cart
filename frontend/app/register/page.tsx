'use client';

import React from 'react';
import { Layout, Form, Input, Button, Typography, message } from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title } = Typography;

export default function RegisterPage() {
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('userId', data.userId);
        message.success('Registration successful. Please verify OTP.');
        router.push('/verify-otp');
      } else {
        message.error('Registration failed');
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
          <Title level={2} style={{ textAlign: 'center' }}>Register</Title>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>Register</Button>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              Already have an account? <Link href="/login">Login</Link>
            </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
}
