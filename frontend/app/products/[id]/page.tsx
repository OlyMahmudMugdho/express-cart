'use client';
import { BASE_URI } from '@/constants/api';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Layout, Typography, Button, Spin, Row, Col, Breadcrumb, Menu, Input, Space, Divider, Drawer, message } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${BASE_URI}/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    try {
      const res = await fetch(`${BASE_URI}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId: id, quantity: 1 }),
      });
      if (res.ok) {
        message.success('Added to cart');
      } else {
        message.error('Failed to add to cart');
      }
    } catch (e) {
      console.error(e);
      message.error('An error occurred');
    }
  };

  if (loading) return <Spin fullscreen />;
  if (!product) return <div>Product not found</div>;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />

      <Content style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Breadcrumb 
          style={{ marginBottom: '24px' }}
          items={[
            { title: <Link href="/">Home</Link> },
            { title: product.name }
          ]} 
        />
        <Row gutter={48}>
          <Col xs={24} md={12}>
            <img src={product.images?.[0]?.url || 'https://via.placeholder.com/400'} alt={product.name} style={{ width: '100%', borderRadius: '12px' }} />
          </Col>
          <Col xs={24} md={12}>
            <Title level={1}>{product.name}</Title>
            <div style={{ marginBottom: '16px' }}>
              <Title level={2} style={{ color: '#1677ff', display: 'inline', marginRight: '16px' }}>${product.price}</Title>
              {product.compareAtPrice && (
                <Text delete type="secondary" style={{ fontSize: '18px' }}>${product.compareAtPrice}</Text>
              )}
            </div>
            <Paragraph><strong>Category:</strong> {product.category?.name}</Paragraph>
            <Paragraph><strong>Stock:</strong> {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}</Paragraph>
            <Paragraph>{product.description}</Paragraph>
            <Button type="primary" size="large" icon={<ShoppingCartOutlined />} disabled={product.stockQuantity === 0} onClick={addToCart}>
              {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </Col>
        </Row>
      </Content>

      <Footer style={{ background: '#f8fafc', color: '#475569', padding: '64px 16px 32px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1677ff', marginBottom: '16px' }}>ExpressCart</div>
              <Paragraph style={{ color: '#64748b', maxWidth: '300px' }}>
                Your destination for premium electronics. Quality products, fast shipping, and exceptional customer experience.
              </Paragraph>
            </Col>
            <Col xs={12} md={4}>
              <Title level={5} style={{ color: '#1e293b' }}>Shop</Title>
              <Space direction="vertical" size="small">
                <a href="#" style={{ color: '#64748b' }}>Electronics</a>
                <a href="#" style={{ color: '#64748b' }}>Accessories</a>
                <a href="#" style={{ color: '#64748b' }}>New Arrivals</a>
              </Space>
            </Col>
            <Col xs={12} md={4}>
              <Title level={5} style={{ color: '#1e293b' }}>Support</Title>
              <Space direction="vertical" size="small">
                <a href="#" style={{ color: '#64748b' }}>Help Center</a>
                <a href="#" style={{ color: '#64748b' }}>Track Order</a>
                <a href="#" style={{ color: '#64748b' }}>Returns</a>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5} style={{ color: '#1e293b' }}>Stay Connected</Title>
              <Paragraph style={{ color: '#64748b' }}>Subscribe to get updates on new products.</Paragraph>
              <Input.Search placeholder="Enter your email" enterButton="Join" size="large" />
            </Col>
          </Row>
          <Divider style={{ borderColor: '#e2e8f0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Typography.Text type="secondary">© 2026 ExpressCart Inc. All rights reserved.</Typography.Text>
            <Space size="large">
              <span style={{ color: '#94a3b8' }}>Privacy Policy</span>
              <span style={{ color: '#94a3b8' }}>Terms of Service</span>
            </Space>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}
