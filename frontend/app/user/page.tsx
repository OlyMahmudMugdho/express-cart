'use client';
import React from 'react';
import AppHeader from '../components/Header';
import { Layout, Typography, Card } from 'antd';
const { Content } = Layout;
export default function User(){
  return (
    <Layout>
      <AppHeader />
      <Content className="main">
        <Typography.Title>User Profile & Orders</Typography.Title>
        <Card>
          <img src="/stitch/user_profile_screenshot.png" alt="user" className="screenshot" />
        </Card>
      </Content>
    </Layout>
  )
}
