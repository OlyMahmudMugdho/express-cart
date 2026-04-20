'use client';
import { BASE_URI } from '@/constants/api';

import React from 'react';
import { Layout, Form, Input, Button, Typography, message } from 'antd';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title } = Typography;

export default function VerifyOtpPage() {
  const router = useRouter();

  const onFinish = async (values: any) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.error('Session expired. Please register again.');
      return;
    }
    try {
      const res = await fetch(BASE_URI + '/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, userId, type: 'verification' }),
      });
      if (res.ok) {
        message.success('OTP verified successfully');
        localStorage.removeItem('userId');
        router.push('/login');
      } else {
        message.error('Invalid OTP');
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
          <Title level={2} style={{ textAlign: 'center' }}>Verify OTP</Title>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item name="code" label="Enter OTP" rules={[{ required: true, len: 6 }]}>
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>Verify</Button>
          </Form>
        </div>
      </Content>
    </Layout>
  );
}
