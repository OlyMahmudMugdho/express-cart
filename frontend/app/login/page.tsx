'use client';

import React, { useState } from 'react';
import { Layout, Form, Input, Button, Typography, message, Card, Space, Divider } from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BASE_URI } from '@/constants/api';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URI + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          message.success('Welcome back to ExpressCart');
          router.push('/');
        } else {
          message.error('Authentication successful but token was not received');
        }
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Invalid email or password');
      }
    } catch (e) {
      message.error('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 16px' }}>
        <div style={{ width: '100%', maxWidth: '450px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              background: '#1677ff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 10px 15px -3px rgba(22, 119, 255, 0.3)'
            }}>
              <LogIn size={32} color="#fff" />
            </div>
            <Title level={2} style={{ margin: 0, fontSize: '32px' }}>Welcome Back</Title>
            <Paragraph type="secondary" style={{ marginTop: '8px', fontSize: '16px' }}>
              Enter your credentials to access your account
            </Paragraph>
          </div>

          <Card 
            style={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            bodyStyle={{ padding: '40px' }}
          >
            <Form onFinish={onFinish} layout="vertical" size="large">
              <Form.Item 
                name="email" 
                label={<Space><Mail size={14} /><span>Email Address</span></Space>}
                rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="name@company.com" style={{ borderRadius: '4px' }} />
              </Form.Item>
              
              <Form.Item 
                name="password" 
                label={<Space><Lock size={14} /><span>Password</span></Space>}
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password placeholder="••••••••" style={{ borderRadius: '4px' }} />
              </Form.Item>

              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <Link href="#" style={{ fontSize: '14px', color: '#1677ff', fontWeight: 500 }}>Forgot password?</Link>
              </div>

              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                className="btn-elegant"
                style={{ borderRadius: '4px', height: '48px', fontSize: '16px', fontWeight: 600 }}
              >
                Sign In
              </Button>
            </Form>

            <Divider style={{ margin: '32px 0' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>New to ExpressCart?</Text>
            </Divider>

            <Button 
              block 
              size="large" 
              onClick={() => router.push('/register')}
              style={{ borderRadius: '4px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span>Create an account</span>
              <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Button>
          </Card>
          
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              By signing in, you agree to our <Link href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Terms</Link> and <Link href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Privacy Policy</Link>
            </Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
