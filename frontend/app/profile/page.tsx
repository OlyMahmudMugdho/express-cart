'use client';

import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Form, 
  Input, 
  Button, 
  Typography, 
  message, 
  Spin, 
  Tabs, 
  Table, 
  Descriptions, 
  InputNumber, 
  Modal, 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Tag, 
  Space,
  Divider,
  Empty
} from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BASE_URI } from '@/constants/api';
import Invoice from '@/components/Invoice';
import { 
  User, 
  Package, 
  MapPin, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  ExternalLink,
  CreditCard,
  ChevronRight,
  Clock,
  Mail,
  Phone
} from 'lucide-react';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [addressForm] = Form.useForm();
  const router = useRouter();

  const showOrderDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URI}/checkout/orders/${orderId}/details`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const orderData = await res.json();
        setSelectedOrder(orderData);
        setIsOrderModalOpen(true);
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Failed to load order details');
      }
    } catch (e) {
      console.error(e);
      message.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const res = await fetch(`${BASE_URI}/cart`, { headers });
    const data = await res.json();
    setCart(data.items || []);
  };

  const fetchAddresses = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const res = await fetch(`${BASE_URI}/users/addresses`, { headers });
    const data = await res.json();
    setAddresses(data || []);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      try {
        const [profRes, orderRes] = await Promise.all([
          fetch(`${BASE_URI}/users/profile`, { headers }),
          fetch(`${BASE_URI}/checkout/orders`, { headers })
        ]);
        
        if (!profRes.ok) throw new Error('Auth failed');
        
        const profData = await profRes.json();
        const orderData = await orderRes.json();
        
        setProfile(profData);
        form.setFieldsValue(profData);
        setOrders(Array.isArray(orderData) ? orderData : []);
        await fetchCart();
        await fetchAddresses();
      } catch (e) {
        console.error(e);
        message.error('Failed to load dashboard data');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [form, router]);

  const addAddress = async (values: any) => {
    try {
      const res = await fetch(`${BASE_URI}/users/addresses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        message.success('Address added successfully');
        setIsAddressModalOpen(false);
        addressForm.resetFields();
        fetchAddresses();
      } else {
        message.error('Failed to add address');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URI}/users/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        message.success('Address removed');
        fetchAddresses();
      } else {
        message.error('Failed to delete address');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`${BASE_URI}/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        message.success('Cart updated');
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        message.error('Failed to update cart');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      const res = await fetch(`${BASE_URI}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        message.success('Item removed');
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        message.error('Failed to remove item');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  if (loading) return <Spin fullscreen size="large" />;

  const tabItems = [
    {
      key: 'orders',
      label: (
        <Space>
          <Package size={16} />
          <span>Orders</span>
        </Space>
      ),
      children: (
        <div style={{ padding: '24px 0' }}>
          {orders.length > 0 ? (
            <Table 
              dataSource={orders} 
              pagination={{ pageSize: 5 }}
              scroll={{ x: 600 }}
              className="elegant-table"
              columns={[
                { 
                  title: 'Order', 
                  dataIndex: 'orderNumber', 
                  key: 'orderNumber',
                  render: (n) => <Text strong>#{n}</Text>
                },
                { 
                  title: 'Date', 
                  dataIndex: 'createdAt', 
                  key: 'createdAt',
                  render: (d) => <Text type="secondary">{new Date(d).toLocaleDateString()}</Text>
                },
                { 
                  title: 'Total', 
                  dataIndex: 'total', 
                  key: 'total', 
                  render: (t) => <Text strong>${Number(t).toFixed(2)}</Text> 
                },
                { 
                  title: 'Status', 
                  dataIndex: 'status', 
                  key: 'status', 
                  render: (s) => (
                    <Tag color={s === 'completed' ? 'success' : s === 'pending' ? 'warning' : 'blue'} style={{ borderRadius: '4px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>
                      {s}
                    </Tag>
                  )
                },
                { 
                  title: '', 
                  key: 'action', 
                  align: 'right' as const,
                  render: (_, record: any) => (
                    <Button 
                      type="text" 
                      icon={<ExternalLink size={16} />} 
                      onClick={() => showOrderDetails(record.id)}
                      className="hover-primary"
                    >
                      Invoice
                    </Button>
                  )
                }
            ]} rowKey="id" />
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="No orders found yet" 
              style={{ padding: '48px 0' }}
            >
              <Button type="primary" onClick={() => router.push('/products')}>Start Shopping</Button>
            </Empty>
          )}
        </div>
      ),
    },
    {
      key: 'cart',
      label: (
        <Space>
          <ShoppingBag size={16} />
          <span>Shopping Cart</span>
        </Space>
      ),
      children: (
        <div style={{ padding: '24px 0' }}>
          {cart.length > 0 ? (
            <>
              <Table 
                dataSource={cart} 
                pagination={false}
                scroll={{ x: 600 }}
                columns={[
                  { 
                    title: 'Product', 
                    key: 'product',
                    render: (_, record) => (
                      <Space size="middle">
                        <img 
                          src={record.product?.images?.[0]?.url || 'https://via.placeholder.com/60'} 
                          style={{ width: 48, height: 48, borderRadius: '4px', objectFit: 'cover' }} 
                        />
                        <Text strong>{record.product?.name}</Text>
                      </Space>
                    )
                  },
                  { 
                    title: 'Price', 
                    dataIndex: 'price', 
                    key: 'price',
                    render: (p) => `$${Number(p).toFixed(2)}`
                  },
                  { 
                    title: 'Quantity', 
                    dataIndex: 'quantity', 
                    key: 'quantity', 
                    width: 120,
                    render: (quantity, record: any) => (
                      <InputNumber 
                        min={1} 
                        size="small"
                        defaultValue={quantity} 
                        onChange={(val) => val && updateCartItem(record.id, val)} 
                        style={{ borderRadius: '4px' }}
                      />
                    )
                  },
                  { 
                    title: '', 
                    key: 'action', 
                    align: 'right' as const,
                    render: (_, record: any) => (
                      <Button 
                        type="text" 
                        danger 
                        icon={<Trash2 size={16} />} 
                        onClick={() => removeCartItem(record.id)} 
                      />
                    )
                  }
                ]} rowKey="id" />
              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <Link href="/checkout">
                    <Button type="primary" size="large" className="btn-elegant" style={{ borderRadius: '4px', height: '48px', padding: '0 32px' }}>
                      Proceed to Checkout
                    </Button>
                </Link>
              </div>
            </>
          ) : (
            <Empty description="Your cart is empty" style={{ padding: '48px 0' }}>
              <Button type="primary" onClick={() => router.push('/products')}>Shop Now</Button>
            </Empty>
          )}
        </div>
      ),
    },
    {
      key: 'addresses',
      label: (
        <Space>
          <MapPin size={16} />
          <span>Addresses</span>
        </Space>
      ),
      children: (
        <div style={{ padding: '24px 0' }}>
          <Row gutter={[24, 24]}>
            {addresses.map((addr) => (
              <Col xs={24} sm={12} key={addr.id}>
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <MapPin size={14} className="text-primary" />
                      <span style={{ textTransform: 'capitalize' }}>{addr.label}</span>
                    </Space>
                  }
                  extra={
                    <Button 
                      type="text" 
                      danger 
                      size="small" 
                      icon={<Trash2 size={14} />} 
                      onClick={() => deleteAddress(addr.id)} 
                    />
                  }
                  style={{ borderRadius: '8px', border: '1px solid #f1f5f9' }}
                >
                  <Paragraph style={{ margin: 0, color: '#475569' }}>
                    {addr.street}<br />
                    {addr.city}, {addr.state} {addr.postalCode}<br />
                    {addr.country}
                  </Paragraph>
                </Card>
              </Col>
            ))}
            <Col xs={24} sm={12}>
              <div 
                onClick={() => setIsAddressModalOpen(true)}
                style={{ 
                  height: '100%', 
                  minHeight: '120px',
                  border: '1px dashed #cbd5e1', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: '#f8fafc'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#1677ff'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              >
                <Plus size={24} style={{ color: '#64748b', marginBottom: '8px' }} />
                <Text type="secondary">Add New Address</Text>
              </div>
            </Col>
          </Row>

          <Modal 
            title={<Title level={4} style={{ margin: 0 }}>Add New Address</Title>} 
            open={isAddressModalOpen} 
            onCancel={() => setIsAddressModalOpen(false)}
            onOk={() => addressForm.submit()}
            okText="Save Address"
            centered
          >
            <Form form={addressForm} layout="vertical" onFinish={addAddress} style={{ marginTop: '24px' }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="label" label="Address Label" rules={[{ required: true }]} tooltip="e.g. Home, Office, Studio">
                    <Input placeholder="Home" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="street" label="Street Address" rules={[{ required: true }]}>
                    <Input placeholder="123 Design St" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="city" label="City" rules={[{ required: true }]}>
                    <Input placeholder="San Francisco" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="state" label="State/Province" rules={[{ required: true }]}>
                    <Input placeholder="CA" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true }]}>
                    <Input placeholder="94103" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                    <Input placeholder="USA" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </div>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      
      <Content style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Row gutter={[48, 48]}>
          {/* Sidebar / Profile Summary */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: '100px' }}>
              <Card 
                style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <Avatar 
                    size={100} 
                    icon={<User size={50} />} 
                    style={{ background: '#f1f5f9', color: '#1677ff', marginBottom: '16px' }}
                  />
                  <Title level={3} style={{ margin: 0 }}>{profile?.firstName} {profile?.lastName}</Title>
                  <Text type="secondary">{profile?.email}</Text>
                </div>

                <Divider style={{ margin: '24px 0' }} />

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Mail size={16} style={{ color: '#94a3b8', marginRight: '12px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Email Address</Text>
                      <Text strong>{profile?.email}</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Phone size={16} style={{ color: '#94a3b8', marginRight: '12px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Phone Number</Text>
                      <Text strong>{profile?.phone || 'Not provided'}</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Clock size={16} style={{ color: '#94a3b8', marginRight: '12px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Member Since</Text>
                      <Text strong>{profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2026'}</Text>
                    </div>
                  </div>
                </Space>

                <Divider style={{ margin: '32px 0' }} />

                <Button 
                  block 
                  size="large" 
                  icon={<Settings size={16} />} 
                  onClick={() => router.push('/profile/edit')}
                  style={{ borderRadius: '4px', height: '48px' }}
                >
                  Edit Account Settings
                </Button>
              </Card>

              <Card 
                style={{ borderRadius: '12px', border: 'none', marginTop: '24px', background: '#1e293b' }}
                bodyStyle={{ padding: '24px' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Title level={5} style={{ color: '#fff', margin: 0 }}>Premium Member</Title>
                  <Text style={{ color: '#94a3b8', fontSize: '14px' }}>Enjoy free shipping and exclusive early access to new collections.</Text>
                  <Link href="/products" style={{ color: '#1677ff', fontWeight: 600 }}>Explore New Arrivals <ChevronRight size={14} style={{ display: 'inline' }} /></Link>
                </Space>
              </Card>
            </div>
          </Col>

          {/* Main Content / Tabs */}
          <Col xs={24} lg={16}>
            <Title level={2} style={{ marginBottom: '32px', fontSize: '32px' }}>Your Workspace</Title>
            <Card 
              style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
              bodyStyle={{ padding: '0 32px 32px' }}
            >
              <Tabs 
                defaultActiveKey="orders" 
                items={tabItems} 
                className="elegant-tabs"
                size="large"
              />
            </Card>
          </Col>
        </Row>
      </Content>

      <Modal
        title={null}
        open={isOrderModalOpen}
        onCancel={() => setIsOrderModalOpen(false)}
        footer={[
          <Button key="close" className="no-print" onClick={() => setIsOrderModalOpen(false)}>Close</Button>,
          <Button key="print" className="no-print" type="primary" onClick={() => window.print()}>Print Invoice</Button>
        ]}
        width={900}
        style={{ top: 20 }}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <div className="printable-invoice">
          <Invoice order={selectedOrder} />
        </div>
      </Modal>

      <style jsx global>{`
        .elegant-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        .elegant-tabs .ant-tabs-tab {
          padding: 24px 16px !important;
          margin: 0 !important;
        }
        .elegant-tabs .ant-tabs-ink-bar {
          height: 3px !important;
          border-radius: 3px 3px 0 0;
        }
        .elegant-table .ant-table-thead > tr > th {
          background: transparent !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #64748b !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          font-weight: 700 !important;
        }
        .elegant-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .hover-primary:hover {
          color: #1677ff !important;
        }
      `}</style>
    </Layout>
  );
}
