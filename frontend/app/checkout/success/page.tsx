'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout, Typography, Button, Result, Spin, Card } from 'antd';
import Navbar from '@/components/Navbar';
import { BASE_URI } from '@/constants/api';

const { Content } = Layout;

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Here you could verify the session with the backend if needed
    // const verifySession = async () => { ... }
    setLoading(false);
  }, [sessionId]);

  if (loading) return <Spin fullscreen />;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Content style={{ padding: '48px 16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <Result
          status="success"
          title="Payment Successful!"
          subTitle={`Your order has been placed successfully. Session ID: ${sessionId?.substring(0, 10)}...`}
          extra={[
            <Button type="primary" key="orders" onClick={() => router.push('/profile')}>
              View My Orders
            </Button>,
            <Button key="shop" onClick={() => router.push('/')}>
              Continue Shopping
            </Button>,
          ]}
        />
      </Content>
    </Layout>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<Spin fullscreen />}>
      <SuccessContent />
    </Suspense>
  );
}
