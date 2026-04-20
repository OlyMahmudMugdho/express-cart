'use client';

import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Input,
  Space,
  Spin,
  Divider,
  Select,
  Carousel,
} from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

interface Category {
  id: string;
  name: string;
}

import Navbar from '@/components/Navbar';
// ... (rest of imports)

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('http://localhost:3000/categories'),
          fetch('http://localhost:3000/products')
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
        setProducts(Array.isArray(prodData) ? prodData : (prodData.products || []));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />

      <Content style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div 
          className="items-center"
          style={{ 
          display: 'flex',
          flexDirection: 'column', // Default for small
          padding: '64px 32px', 
          background: '#fff', 
          borderRadius: '16px',
          marginBottom: '48px',
          marginTop: '24px'
        }}>
          {/* Note: I will use a media query in global CSS or here to fix this properly if needed, but for now I'll just rely on the style object. Wait, I can't use @media in inline styles. I will use the responsive Tailwind classes again, but with higher specificity/!important if needed. Let's try adding display: flex to the media query in global.css or just force it here. Actually, I'll use `flex-wrap` and fixed widths. */}
          <style jsx>{`
            @media (min-width: 768px) {
              .hero-container {
                flex-direction: row !important;
              }
            }
          `}</style>
          <div className="hero-container flex flex-col md:flex-row items-center w-full">
            <div style={{ flex: 1 }} className="text-center md:text-left md:pr-12">
               <Title level={1} style={{ fontSize: '40px', color: '#1e293b' }}>Elevate Your Shopping Experience</Title>
               <Paragraph style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px' }}>Discover the latest products and enjoy seamless, secure shopping from the comfort of your home.</Paragraph>
               <Space direction="horizontal" className="justify-center md:justify-start">
                 <Button type="primary" size="large">Shop Now</Button>
                 <Button size="large">Explore Deals</Button>
               </Space>
            </div>
            <div style={{ flex: 1, marginTop: '32px', width: '100%' }} className="md:mt-0">
              <img src="/assets/banner.jpg" alt="Hero Banner" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px' }} />
            </div>
          </div>
        </div>


        <Title level={2}>Featured Categories</Title>
        <div className="md:hidden">
          <Carousel autoplay dotPosition="bottom">
            {categories.map((c) => (
              <div key={c.id} style={{ padding: '0 8px' }}>
                <Card title={c.name} hoverable style={{ margin: '8px' }}>Explore</Card>
              </div>
            ))}
          </Carousel>
        </div>
        <div className="hidden md:block">
          <Row gutter={[16, 16]} style={{ marginBottom: '48px' }}>
             {loading ? <Col span={24} style={{ textAlign: 'center' }}><Spin /></Col> : categories.slice(0, 4).map(c => (
               <Col md={8} lg={6} key={c.id}>
                 <Card title={c.name} hoverable>Explore</Card>
               </Col>
             ))}
          </Row>
        </div>

        <Title level={2}>Featured Products</Title>
        <Row gutter={[16, 16]}>
             {loading ? <Col span={24} style={{ textAlign: 'center' }}><Spin /></Col> : products.slice(0, 8).map((p: any) => (
               <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
                 <Card 
                    hoverable 
                    cover={<img alt={p.name} src={p.images?.[0]?.url || 'https://via.placeholder.com/200'} style={{ height: '200px', objectFit: 'cover' }} />}
                 >
                   <Card.Meta 
                     title={<Link href={`/products/${p.id}`}>{p.name}</Link>} 
                     description={
                       <div>
                         <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3f51b5' }}>${p.price}</div>
                         {p.compareAtPrice && <Text delete style={{ fontSize: '12px' }}>${p.compareAtPrice}</Text>}
                         <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>{p.category?.name}</div>
                       </div>
                     } 
                   />
                   <Button type="primary" style={{ marginTop: '16px', width: '100%' }}>Add to Cart</Button>
                 </Card>
               </Col>
             ))}
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
