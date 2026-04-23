'use client';

import React, { useState } from 'react';
import { Layout, Form, Input, Button, Typography, message, Card, Space, Divider, Row, Col } from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BASE_URI } from '@/constants/api';
import { UserPlus, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URI + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('userId', data.userId);
        message.success('Account created! Please verify your email.');
        router.push('/verify-otp');
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Registration failed. Please try again.');
      }
    } catch (e) {
      message.error('Connection error. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 16px' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
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
              <UserPlus size={32} color="#fff" />
            </div>
            <Title level={2} style={{ margin: 0, fontSize: '32px' }}>Create Account</Title>
            <Paragraph type="secondary" style={{ marginTop: '8px', fontSize: '16px' }}>
              Join ExpressCart for a refined shopping experience
            </Paragraph>
          </div>

          <Card 
            style={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            bodyStyle={{ padding: '40px' }}
          >
            <Form onFinish={onFinish} layout="vertical" size="large">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="firstName" 
                    label={<Space><User size={14} /><span>First Name</span></Space>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="John" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="lastName" 
                    label={<Space><User size={14} /><span>Last Name</span></Space>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="Doe" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item 
                name="email" 
                label={<Space><Mail size={14} /><span>Email Address</span></Space>}
                rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
              >
                <Input placeholder="name@company.com" style={{ borderRadius: '4px' }} />
              </Form.Item>
              
              <Form.Item 
                name="phone" 
                label={<Space><Phone size={14} /><span>Phone Number</span></Space>}
              >
                <Input placeholder="+1 (555) 000-0000" style={{ borderRadius: '4px' }} />
              </Form.Item>

              <Form.Item 
                name="password" 
                label={<Space><Lock size={14} /><span>Password</span></Space>}
                rules={[{ required: true, message: 'Create a password' }, { min: 6, message: 'Minimum 6 characters' }]}
              >
                <Input.Password placeholder="••••••••" style={{ borderRadius: '4px' }} />
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                className="btn-elegant"
                style={{ borderRadius: '4px', height: '48px', fontSize: '16px', fontWeight: 600, marginTop: '12px' }}
              >
                Create Account
              </Button>
            </Form>

            <Divider style={{ margin: '32px 0' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>Already a member?</Text>
            </Divider>

            <Button 
              block 
              size="large" 
              onClick={() => router.push('/login')}
              style={{ borderRadius: '4px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span>Sign in to account</span>
              <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Button>
          </Card>
          
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              By registering, you agree to our <Link href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Terms</Link> and <Link href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Privacy Policy</Link>
            </Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
