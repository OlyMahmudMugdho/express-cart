'use client';
import React from 'react';
import AppHeader from '../components/Header';
import { Layout, Typography, Card, Button } from 'antd';
const { Content } = Layout;
export default function Checkout(){
  return (
    <Layout>
      <AppHeader />
      <Content className="main">
        <Typography.Title>Checkout Flow</Typography.Title>
        <Card>
          <img src="/stitch/checkout_screenshot.png" alt="checkout" className="screenshot" />
        </Card>
        <div style={{marginTop:12}}>
          <Button type="primary">Proceed to Payment</Button>
        </div>
      </Content>
    </Layout>
  )
}
