'use client';

import { BASE_URI } from '@/constants/api';
import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Button, 
  Typography, 
  message, 
  Spin, 
  Card, 
  Divider, 
  Radio, 
  Space, 
  Form, 
  Input, 
  Row, 
  Col, 
  Breadcrumb,
  Badge
} from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  Plus,
  ShoppingBag,
  Info
} from 'lucide-react';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

interface AddressForm {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/checkout');
      return;
    }

    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      try {
        const [checkRes, addrRes] = await Promise.all([
          fetch(`${BASE_URI}/checkout/initiate`, { headers }),
          fetch(`${BASE_URI}/users/addresses`, { headers })
        ]);
        
        if (!checkRes.ok) throw new Error('Checkout failed');
        
        const cData = await checkRes.json();
        const aData = await addrRes.json();
        
        setCheckoutData(cData);
        setAddresses(Array.isArray(aData) ? aData : []);
        if (Array.isArray(aData) && aData.length > 0) {
          const def = aData.find((a: any) => a.isDefault) || aData[0];
          setSelectedAddressId(def.id);
        }
      } catch (e) {
        message.error('Cart empty or session expired');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const placeOrder = async (values?: AddressForm) => {
    if (!selectedAddressId && !showNewAddressForm) {
      message.warning('Please select a shipping address');
      return;
    }

    setPlacingOrder(true);
    try {
      const requestBody: any = { 
        paymentMethod,
        notes: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment',
      };
      
      if (showNewAddressForm && values) {
        requestBody.newAddress = {
          label: values.label || 'Home',
          street: values.street,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
          phone: values.phone,
        };
      } else {
        requestBody.addressId = selectedAddressId;
      }

      const res = await fetch(`${BASE_URI}/checkout/place-order`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      
      if (res.ok || res.status === 201) {
        if (data.checkoutSessionUrl) {
          message.success('Redirecting to secure payment...');
          setTimeout(() => {
            window.location.href = data.checkoutSessionUrl;
          }, 1000);
        } else {
          message.success('Order placed successfully!');
          window.dispatchEvent(new Event('cart-updated'));
          setTimeout(() => {
            router.push('/profile');
          }, 1500);
        }
      } else {
        message.error(data?.message || 'Failed to place order');
        setPlacingOrder(false);
      }
    } catch (e: any) {
      console.error('Order error:', e);
      message.error('An error occurred. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (loading) return <Spin fullscreen size="large" />;
  if (!checkoutData) return null;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <Content style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <Button 
            type="link" 
            icon={<ArrowLeft size={16} />} 
            onClick={() => router.push('/products')}
            style={{ padding: 0, color: '#64748b', display: 'flex', alignItems: 'center', marginBottom: '24px' }}
          >
            Back to Shop
          </Button>
          <Breadcrumb 
            items={[
              { title: <Link href="/">Home</Link> },
              { title: <Link href="/products">Shop</Link> },
              { title: <Text strong>Checkout</Text> }
            ]} 
          />
        </div>

        <Row gutter={[48, 48]}>
          <Col xs={24} lg={15}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Shipping Address Section */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
                  <div style={{ background: '#1e293b', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>1</div>
                  <Title level={4} style={{ margin: 0 }}>Shipping Information</Title>
                </div>
                
                <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  {addresses.length > 0 && !showNewAddressForm && (
                    <Radio.Group 
                      onChange={e => setSelectedAddressId(e.target.value)} 
                      value={selectedAddressId}
                      style={{ width: '100%' }}
                    >
                      <Row gutter={[16, 16]}>
                        {addresses.map(addr => (
                          <Col span={24} key={addr.id}>
                            <Radio.Button 
                              value={addr.id} 
                              style={{ 
                                width: '100%', 
                                height: 'auto', 
                                padding: '16px', 
                                borderRadius: '8px',
                                border: selectedAddressId === addr.id ? '2px solid #1677ff' : '1px solid #f1f5f9',
                                background: selectedAddressId === addr.id ? '#f0f7ff' : '#fff',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ marginLeft: '12px' }}>
                                <Text strong style={{ display: 'block', fontSize: '14px', textTransform: 'capitalize' }}>{addr.label} Address</Text>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  {addr.street}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                                </Text>
                              </div>
                            </Radio.Button>
                          </Col>
                        ))}
                        <Col span={24}>
                          <Button 
                            type="dashed" 
                            block 
                            size="large" 
                            icon={<Plus size={16} />} 
                            onClick={() => setShowNewAddressForm(true)}
                            style={{ height: '56px', borderRadius: '8px' }}
                          >
                            Add New Address
                          </Button>
                        </Col>
                      </Row>
                    </Radio.Group>
                  )}
                  
                  {(showNewAddressForm || addresses.length === 0) && (
                    <Form form={form} layout="vertical" onFinish={placeOrder} size="large">
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item name="label" label="Address Label" rules={[{ required: true }]}>
                            <Input placeholder="Home, Office, etc." />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item name="street" label="Street Address" rules={[{ required: true }]}>
                            <Input placeholder="123 Modern Avenue" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="city" label="City" rules={[{ required: true }]}>
                            <Input placeholder="City" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="state" label="State / Province" rules={[{ required: true }]}>
                            <Input placeholder="State" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true }]}>
                            <Input placeholder="Postal code" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                            <Input placeholder="Country" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Space>
                        {addresses.length > 0 && (
                          <Button onClick={() => setShowNewAddressForm(false)}>Cancel</Button>
                        )}
                        <Text type="secondary" style={{ fontSize: '12px' }}>Fill all details to proceed</Text>
                      </Space>
                    </Form>
                  )}
                </Card>
              </section>

              {/* Payment Method Section */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
                  <div style={{ background: '#1e293b', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>2</div>
                  <Title level={4} style={{ margin: 0 }}>Payment Method</Title>
                </div>
                
                <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <Radio.Group 
                    onChange={e => setPaymentMethod(e.target.value)} 
                    value={paymentMethod}
                    style={{ width: '100%' }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Radio.Button 
                          value="cod" 
                          style={{ 
                            width: '100%', 
                            height: 'auto', 
                            padding: '24px', 
                            borderRadius: '8px',
                            border: paymentMethod === 'cod' ? '2px solid #1677ff' : '1px solid #f1f5f9',
                            background: paymentMethod === 'cod' ? '#f0f7ff' : '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}
                        >
                          <Truck size={24} style={{ marginBottom: '8px', color: paymentMethod === 'cod' ? '#1677ff' : '#64748b' }} />
                          <Text strong style={{ display: 'block' }}>Cash on Delivery</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Pay when you receive</Text>
                        </Radio.Button>
                      </Col>
                      <Col xs={24} md={12}>
                        <Radio.Button 
                          value="stripe" 
                          style={{ 
                            width: '100%', 
                            height: 'auto', 
                            padding: '24px', 
                            borderRadius: '8px',
                            border: paymentMethod === 'stripe' ? '2px solid #1677ff' : '1px solid #f1f5f9',
                            background: paymentMethod === 'stripe' ? '#f0f7ff' : '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}
                        >
                          <CreditCard size={24} style={{ marginBottom: '8px', color: paymentMethod === 'stripe' ? '#1677ff' : '#64748b' }} />
                          <Text strong style={{ display: 'block' }}>Card Payment</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Secure online payment</Text>
                        </Radio.Button>
                      </Col>
                    </Row>
                  </Radio.Group>
                </Card>
              </section>
            </Space>
          </Col>

          {/* Order Summary Sidebar */}
          <Col xs={24} lg={9}>
            <div style={{ position: 'sticky', top: '100px' }}>
              <Title level={4} style={{ marginBottom: '20px' }}>Order Summary</Title>
              <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }}>
                  {checkoutData.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                      <img 
                        src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'} 
                        style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ display: 'block' }}>{item.product.name}</Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Qty: {item.quantity}</Text>
                      </div>
                      <Text strong>${item.total}</Text>
                    </div>
                  ))}
                </div>
                
                <Divider style={{ margin: '0 0 24px 0' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Subtotal</Text>
                    <Text strong>${checkoutData.total}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Shipping</Text>
                    <Text type="success" strong>Complimentary</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <Title level={4} style={{ margin: 0 }}>Total</Title>
                    <Title level={4} style={{ margin: 0 }}>${checkoutData.total}</Title>
                  </div>
                </div>

                <Divider style={{ margin: '24px 0' }} />
                
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <Space align="start" size="middle">
                    <ShieldCheck size={20} style={{ color: '#1677ff', marginTop: '2px' }} />
                    <Text style={{ fontSize: '13px', color: '#475569' }}>
                      Your information is protected with industry-standard encryption.
                    </Text>
                  </Space>
                </div>

                {!showNewAddressForm ? (
                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    className="btn-elegant"
                    style={{ height: '56px', borderRadius: '4px', fontWeight: 600, fontSize: '16px' }} 
                    onClick={() => placeOrder()}
                    loading={placingOrder}
                    disabled={!selectedAddressId}
                  >
                    {paymentMethod === 'cod' ? 'Complete Purchase' : 'Pay with Secure Checkout'}
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    className="btn-elegant"
                    style={{ height: '56px', borderRadius: '4px', fontWeight: 600, fontSize: '16px' }} 
                    onClick={() => form.submit()}
                    loading={placingOrder}
                  >
                    Confirm & Proceed
                  </Button>
                )}
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Tax calculated at checkout where applicable.
                  </Text>
                </div>
              </Card>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Space size="middle">
                  <CreditCard size={20} style={{ color: '#94a3b8' }} />
                  <Truck size={20} style={{ color: '#94a3b8' }} />
                  <Info size={20} style={{ color: '#94a3b8' }} />
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </Content>

      <Footer style={{ background: '#fff', color: '#94a3b8', padding: '60px 24px 40px', borderTop: '1px solid #f1f5f9', marginTop: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Text style={{ color: '#94a3b8', fontSize: '14px' }}>© 2026 ExpressCart Inc. Secure & Encrypted.</Text>
        </div>
      </Footer>
      <style jsx global>{`
        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
          z-index: 1;
          color: #1677ff;
          background: #f0f7ff;
          border-color: #1677ff;
        }
        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
          background-color: #1677ff;
        }
        .ant-radio-button-wrapper {
          border-inline-start-width: 1px !important;
        }
      `}</style>
    </Layout>
  );
}
