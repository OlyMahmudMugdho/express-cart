'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '../components/Header';
import { Layout, Typography, Card, Form, Input, Button, Tabs, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
const { Content } = Layout;

export default function Auth(){
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otpState, setOtpState] = useState({ visible: false, email: '', purpose: '', userId: '' });
  const [otpLoading, setOtpLoading] = useState(false);

  const onLogin = async (values: any) => {
    setLoading(true);
    try {
      await login(values);
      message.success('Login successful');
      router.push('/user');
    } catch (err) {
      message.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/register', values);
      message.success('Registration successful. Please verify OTP.');
      setOtpState({ visible: true, email: res.data.email, purpose: res.data.otpPurpose, userId: res.data.userId });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onOtpVerify = async (values: any) => {
    setOtpLoading(true);
    try {
      await api.post('/api/v1/auth/otp/verify', {
        email: otpState.email,
        purpose: otpState.purpose,
        code: values.otp,
      });
      message.success('Email verified! You can now log in.');
      setOtpState({ visible: false, email: '', purpose: '', userId: '' });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };


  const onResendOtp = async () => {
    setOtpLoading(true);
    try {
      await api.post('/api/v1/auth/otp/send', { email: otpState.email, purpose: otpState.purpose });
      message.success('OTP resent successfully.');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const renderRegisterContent = () => {
    if (otpState.visible) {
      return (
        <Form layout="vertical" onFinish={onOtpVerify}>
          <Typography.Paragraph>Please enter the OTP sent to {otpState.email}</Typography.Paragraph>
          <Form.Item name="otp" label="OTP Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={otpLoading} block>Verify OTP</Button>
          <Button type="link" onClick={onResendOtp} loading={otpLoading} block style={{ marginTop: 10 }}>Resend OTP</Button>
        </Form>
      );
    }
    return (
      <Form layout="vertical" onFinish={onRegister}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>Register</Button>
      </Form>
    );
  };

  const items = [
    {
      key: '1',
      label: 'Login',
      children: (
        <Form layout="vertical" onFinish={onLogin}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Login</Button>
        </Form>
      )
    },
    {
      key: '2',
      label: 'Register',
      children: renderRegisterContent()
    }
  ];

  return (
    <Layout>
      <AppHeader />
      <Content className="main" style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Card style={{ width: 400 }}>
          <Typography.Title level={2} style={{ textAlign: 'center' }}>Authentication</Typography.Title>
          <Tabs defaultActiveKey="1" items={items} />
        </Card>
      </Content>
    </Layout>
  )
}
