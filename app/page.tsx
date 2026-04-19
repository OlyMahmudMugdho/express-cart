import React from 'react';
import Header from './components/Header';
import { Layout, Typography, Button } from 'antd';
const { Content } = Layout;

export default function Home(){
  return (
    <Layout>
      <Header />
      <Content className="main">
        <Typography.Title>Homepage</Typography.Title>
        <p>Prototype screenshot below (wire up components from Ant Design to match).</p>
        <img src="/stitch/homepage_screenshot.png" alt="homepage" className="screenshot" />
        <div style={{marginTop:16}}>
          <Button type="primary">Shop Now</Button>
        </div>
      </Content>
    </Layout>
  )
}
