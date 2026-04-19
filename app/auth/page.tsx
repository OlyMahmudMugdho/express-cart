import React from 'react';
import Header from '../components/Header';
import { Layout, Typography, Card } from 'antd';
const { Content } = Layout;
export default function Auth(){
  return (
    <Layout>
      <Header />
      <Content className="main">
        <Typography.Title>Authentication (Login / Signup / OTP)</Typography.Title>
        <Card>
          <img src="/stitch/authentication_screenshot.png" alt="auth" className="screenshot" />
        </Card>
      </Content>
    </Layout>
  )
}
