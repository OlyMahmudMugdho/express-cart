import React from 'react';
import Header from '../components/Header';
import { Layout, Typography, Card } from 'antd';
const { Content } = Layout;
export default function User(){
  return (
    <Layout>
      <Header />
      <Content className="main">
        <Typography.Title>User Profile & Orders</Typography.Title>
        <Card>
          <img src="/stitch/user_profile_screenshot.png" alt="user" className="screenshot" />
        </Card>
      </Content>
    </Layout>
  )
}
