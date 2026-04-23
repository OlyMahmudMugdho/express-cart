'use client';

import React, { useState } from 'react';
import { Layout, Form, Input, Button, Typography, message, Card, Space, Divider } from 'antd';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { BASE_URI } from '@/constants/api';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.error('Session expired. Please register again.');
      router.push('/register');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(BASE_URI + '/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, userId, type: 'verification' }),
      });
      if (res.ok) {
        message.success('Account verified! You can now sign in.');
        localStorage.removeItem('userId');
        router.push('/login');
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Invalid verification code');
      }
    } catch (e) {
      message.error('An error occurred. Please try again.');
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
              <ShieldCheck size={32} color="#fff" />
            </div>
            <Title level={2} style={{ margin: 0, fontSize: '32px' }}>Verify Email</Title>
            <Paragraph type="secondary" style={{ marginTop: '8px', fontSize: '16px' }}>
              Enter the 6-digit code we sent to your inbox
            </Paragraph>
          </div>

          <Card 
            style={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            bodyStyle={{ padding: '40px' }}
          >
            <Form onFinish={onFinish} layout="vertical" size="large">
              <Form.Item 
                name="code" 
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Verification Code</Text>}
                rules={[
                  { required: true, message: 'Please enter the code' },
                  { len: 6, message: 'Code must be 6 digits' }
                ]}
              >
                <Input 
                  placeholder="000000" 
                  maxLength={6} 
                  style={{ 
                    borderRadius: '4px', 
                    textAlign: 'center', 
                    fontSize: '24px', 
                    letterSpacing: '8px',
                    height: '64px',
                    fontWeight: 700
                  }} 
                />
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                className="btn-elegant"
                style={{ borderRadius: '4px', height: '48px', fontSize: '16px', fontWeight: 600, marginTop: '12px' }}
              >
                Verify Code
              </Button>
            </Form>

            <Divider style={{ margin: '32px 0' }} />

            <div style={{ textAlign: 'center' }}>
              <Paragraph type="secondary" style={{ fontSize: '14px', marginBottom: '8px' }}>
                Didn't receive the code?
              </Paragraph>
              <Button 
                type="link" 
                icon={<RefreshCw size={14} />} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#1677ff', fontWeight: 600 }}
              >
                Resend Code
              </Button>
            </div>
          </Card>
          
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Button 
              type="link" 
              onClick={() => router.push('/register')}
              style={{ color: '#64748b', fontSize: '14px' }}
            >
              Back to registration
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
