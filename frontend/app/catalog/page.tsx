'use client';
import React from 'react';
import AppHeader from '../components/Header';
import { Layout, Typography, Row, Col, Card } from 'antd';
const { Content } = Layout;
export default function Catalog(){
  return (
    <Layout>
      <AppHeader />
      <Content className="main">
        <Typography.Title>Product Catalog</Typography.Title>
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <img src="/stitch/product_catalog_screenshot.png" alt="catalog" className="screenshot" />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
