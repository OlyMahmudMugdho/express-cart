'use client';
import { BASE_URI } from '@/constants/api';

import React, { useEffect, useState } from 'react';
import { Layout, Button, Typography, message, Spin, Card, Divider } from 'antd';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URI}/checkout/initiate`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setCheckoutData(data);
        setLoading(false);
      })
      .catch(() => {
        message.error('Failed to initiate checkout');
        setLoading(false);
      });
  }, []);

  const placeOrder = async () => {
    try {
      const res = await fetch(`${BASE_URI}/checkout/place-order`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ notes: 'Cash on Delivery' }),
      });
      if (res.ok) {
        message.success('Order placed successfully!');
        router.push('/profile');
      } else {
        message.error('Failed to place order');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  if (loading) return <Spin fullscreen />;
  if (!checkoutData) return <div>Cart empty or checkout failed</div>;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Content style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <Title level={2}>Checkout</Title>
        <Card title="Order Summary">
            {checkoutData.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text>{item.product.name} x {item.quantity}</Text>
                    <Text>${item.total}</Text>
                </div>
            ))}
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Title level={4}>Total</Title>
                <Title level={4}>${checkoutData.total}</Title>
            </div>
        </Card>
        <Button type="primary" size="large" block style={{ marginTop: '24px' }} onClick={placeOrder}>
            Place Order (Cash on Delivery)
        </Button>
      </Content>
    </Layout>
  );
}
