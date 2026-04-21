'use client';
import { BASE_URI } from '@/constants/api';

import React, { useEffect, useState } from 'react';
import { Layout, Button, Typography, message, Spin, Card, Divider, Radio, Space, Form, Input, Select } from 'antd';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Content } = Layout;
const { Title, Text } = Typography;

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
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      try {
        const [checkRes, addrRes] = await Promise.all([
          fetch(`${BASE_URI}/checkout/initiate`, { headers }),
          fetch(`${BASE_URI}/users/addresses`, { headers })
        ]);
        
        const cData = await checkRes.json();
        const aData = await addrRes.json();
        
        setCheckoutData(cData);
        setAddresses(Array.isArray(aData) ? aData : []);
        if (Array.isArray(aData) && aData.length > 0) {
          const def = aData.find(a => a.isDefault) || aData[0];
          setSelectedAddressId(def.id);
        }
      } catch (e) {
        message.error('Failed to load checkout data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const placeOrder = async (values?: AddressForm) => {
    if (!selectedAddressId && !showNewAddressForm) {
      message.warning('Please select a shipping address');
      return;
    }

    setPlacingOrder(true);
    try {
      const requestBody: any = { notes: 'Cash on Delivery' };
      
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
      if (res.ok) {
        message.success('Order placed successfully!');
        router.push('/profile');
      } else {
        message.error('Failed to place order');
      }
    } catch (e) {
      message.error('An error occurred');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSubmit = async (values: AddressForm) => {
    await placeOrder(values);
  };

  if (loading) return <Spin fullscreen />;
  if (!checkoutData) return <div>Cart empty or checkout failed</div>;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <Content style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <Title level={2}>Checkout</Title>
        
        <Card title="Shipping Address" style={{ marginBottom: '24px' }}>
          {addresses.length > 0 && !showNewAddressForm && (
            <Radio.Group 
              onChange={e => setSelectedAddressId(e.target.value)} 
              value={selectedAddressId}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {addresses.map(addr => (
                  <Radio key={addr.id} value={addr.id} style={{ width: '100%', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                    <div style={{ display: 'inline-block', marginLeft: '8px' }}>
                      <Text strong>{addr.street}</Text>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                      </div>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          )}
          
          {showNewAddressForm ? (
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="label" label="Label" rules={[{ required: true, message: 'Please enter a label' }]}>
                <Input placeholder="e.g., Home, Office" />
              </Form.Item>
              <Form.Item name="street" label="Street Address" rules={[{ required: true, message: 'Please enter street address' }]}>
                <Input placeholder="Street address" />
              </Form.Item>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item name="city" label="City" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="City" />
                </Form.Item>
                <Form.Item name="state" label="State" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="State" />
                </Form.Item>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="Postal code" />
                </Form.Item>
                <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="Country" />
                </Form.Item>
              </div>
              <Form.Item name="phone" label="Phone (optional)">
                <Input placeholder="Phone number" />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={placingOrder}>
                  Save & Place Order
                </Button>
                <Button onClick={() => setShowNewAddressForm(false)}>
                  Cancel
                </Button>
              </Space>
            </Form>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <Button onClick={() => setShowNewAddressForm(true)}>
                + Add New Address
              </Button>
            </div>
          )}
        </Card>

        <Card title="Order Summary">
            {checkoutData.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text>{item.product.name} x {item.quantity}</Text>
                    <Text>${item.total}</Text>
                </div>
            ))}
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Payment Method</Text>
                <Text strong>Cash on Delivery</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <Title level={4}>Total</Title>
                <Title level={4}>${checkoutData.total}</Title>
            </div>
            {!showNewAddressForm && (
              <Button 
                type="primary" 
                size="large" 
                block 
                style={{ marginTop: '24px', height: '50px' }} 
                onClick={() => placeOrder()}
                loading={placingOrder}
                disabled={!selectedAddressId}
              >
                Confirm Order
              </Button>
            )}
        </Card>
      </Content>
    </Layout>
  );
}
