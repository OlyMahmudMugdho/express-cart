'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Typography, message, Spin, Card, Row, Col, Space, Divider } from 'antd';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { BASE_URI } from '@/constants/api';
import { User, Phone, Mail, ArrowLeft, Save } from 'lucide-react';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function EditProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${BASE_URI}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        form.setFieldsValue(data);
        setLoading(false);
      })
      .catch(err => {
        message.error('Session expired');
        router.push('/login');
      });
  }, [form, router]);

  const onFinish = async (values: any) => {
    try {
      const res = await fetch(`${BASE_URI}/users/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        message.success('Profile updated successfully');
        router.push('/profile');
      } else {
        message.error('Failed to update profile');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  if (loading) return <Spin fullscreen size="large" />;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <Content style={{ padding: '48px 24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <Button 
          type="link" 
          icon={<ArrowLeft size={16} />} 
          onClick={() => router.push('/profile')}
          style={{ padding: 0, marginBottom: '24px', color: '#64748b', display: 'flex', alignItems: 'center' }}
        >
          Back to Dashboard
        </Button>

        <Title level={2} style={{ marginBottom: '32px', fontSize: '32px' }}>Account Settings</Title>
        
        <Card 
          style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
          bodyStyle={{ padding: '40px' }}
        >
          <Form form={form} onFinish={onFinish} layout="vertical" size="large">
            <Title level={4} style={{ marginBottom: '24px' }}>Personal Information</Title>
            
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="firstName" 
                  label={<Space><User size={14} /><span>First Name</span></Space>}
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input placeholder="John" style={{ borderRadius: '4px' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="lastName" 
                  label={<Space><User size={14} /><span>Last Name</span></Space>}
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input placeholder="Doe" style={{ borderRadius: '4px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: '24px 0' }} />

            <Title level={4} style={{ marginBottom: '24px' }}>Contact Details</Title>

            <Row gutter={24}>
              <Col xs={24}>
                <Form.Item 
                  name="email" 
                  label={<Space><Mail size={14} /><span>Email Address</span></Space>}
                >
                  <Input disabled style={{ borderRadius: '4px', background: '#f8fafc' }} />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '-16px', marginBottom: '24px' }}>
                  Email address cannot be changed. Please contact support if you need to update it.
                </Text>
              </Col>
              <Col xs={24}>
                <Form.Item 
                  name="phone" 
                  label={<Space><Phone size={14} /><span>Phone Number</span></Space>}
                >
                  <Input placeholder="+1 (555) 000-0000" style={{ borderRadius: '4px' }} />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <Button 
                onClick={() => router.push('/profile')}
                style={{ borderRadius: '4px', height: '48px', padding: '0 32px' }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<Save size={18} />}
                className="btn-elegant"
                style={{ borderRadius: '4px', height: '48px', padding: '0 32px' }}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Card>

        <Card 
          style={{ borderRadius: '12px', border: 'none', marginTop: '24px', background: '#fff' }}
          bodyStyle={{ padding: '32px' }}
        >
          <Title level={5} style={{ margin: 0, color: '#ff4d4f' }}>Danger Zone</Title>
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Delete Account</Text>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Permanently remove your account and all associated data.
              </Paragraph>
            </div>
            <Button danger ghost>Delete Account</Button>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
