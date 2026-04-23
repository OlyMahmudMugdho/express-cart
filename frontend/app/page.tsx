'use client';

import React, { useEffect, useState } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Input,
  Space,
  Spin,
  Divider,
  Carousel,
  message,
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BASE_URI } from '@/constants/api';

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

interface Category {
  id: string;
  name: string;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${BASE_URI}/categories`),
          fetch(`${BASE_URI}/products`)
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

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('Please login to add items to cart');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${BASE_URI}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        message.success('Added to cart');
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        const error = await res.json();
        message.error(error.message || 'Failed to add to cart');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />

      <Content style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
        <div 
          style={{ 
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 0', 
          background: '#fff', 
          marginBottom: '48px',
          marginTop: '24px'
        }}>
          <div className="hero-inner flex flex-col md:flex-row items-center w-full">
            <div style={{ flex: 1 }} className="text-center md:text-left md:pr-12">
               <Title level={1} style={{ fontSize: '48px', color: '#1e293b', fontWeight: 800, lineHeight: 1.2 }}>Elevate Your <br/><span style={{ color: '#1677ff' }}>Shopping Experience</span></Title>
               <Paragraph style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px', maxWidth: '500px' }}>
                 Discover the latest premium products and enjoy seamless, secure shopping from the comfort of your home.
               </Paragraph>
               <Space direction="horizontal" size="large" className="justify-center md:justify-start">
                 <Button type="primary" size="large" onClick={() => router.push('/products')} style={{ height: '48px', padding: '0 32px', borderRadius: '8px' }}>Shop Now</Button>
                 <Button size="large" onClick={() => router.push('/products')} style={{ height: '48px', padding: '0 32px', borderRadius: '8px' }}>Explore Products</Button>
               </Space>
            </div>
            <div style={{ flex: 1, marginTop: '48px', width: '100%' }} className="md:mt-0">
              <img src="/assets/banner.jpg" alt="Hero Banner" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} />
            </div>
          </div>
        </div>


        <Title level={3} style={{ marginBottom: '24px' }}>Featured Categories</Title>
        <div className="md:hidden" style={{ marginBottom: '48px' }}>
          <Carousel autoplay dotPosition="bottom">
            {categories.map((c) => (
              <div key={c.id}>
                <Card 
                  hoverable 
                  style={{ margin: '8px', borderRadius: '12px', textAlign: 'center', background: '#f8fafc' }}
                  onClick={() => router.push(`/products?category=${c.id}`)}
                >
                  <Title level={4} style={{ margin: 0 }}>{c.name}</Title>
                  <Text type="secondary">Explore Collection</Text>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
        <div className="hidden md:block">
          <Row gutter={[24, 24]} style={{ marginBottom: '64px' }}>
             {loading ? <Col span={24} style={{ textAlign: 'center' }}><Spin size="large" /></Col> : categories.slice(0, 4).map(c => (
               <Col md={6} key={c.id}>
                 <Card 
                  hoverable 
                  style={{ borderRadius: '12px', textAlign: 'center', background: '#f8fafc', border: 'none' }}
                  onClick={() => router.push(`/products?category=${c.id}`)}
                 >
                   <Title level={4} style={{ margin: 0 }}>{c.name}</Title>
                   <Text type="secondary">Explore Collection</Text>
                 </Card>
               </Col>
             ))}
          </Row>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0 }}>Trending Products</Title>
          <Link href="/products" style={{ color: '#1677ff', fontWeight: 600 }}>View All Products →</Link>
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: '64px' }}>
             {loading ? <Col span={24} style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></Col> : products.slice(0, 8).map((p: any) => (
               <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
                 <Card 
                    hoverable 
                    style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}
                    cover={
                      <div style={{ position: 'relative' }}>
                        <img 
                          alt={p.name} 
                          src={p.images?.[0]?.url || 'https://via.placeholder.com/200'} 
                          style={{ height: '240px', width: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    }
                 >
                   <Card.Meta 
                     title={<Link href={`/products/details?id=${p.id}`} style={{ color: '#1e293b' }}>{p.name}</Link>} 
                     description={
                       <div style={{ marginTop: '8px' }}>
                         <Space size={8}>
                           <Text strong style={{ fontSize: '18px', color: '#1677ff' }}>${Number(p.price).toFixed(2)}</Text>
                           {p.compareAtPrice && <Text delete style={{ fontSize: '14px', color: '#94a3b8' }}>${Number(p.compareAtPrice).toFixed(2)}</Text>}
                         </Space>
                         <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category?.name}</div>
                       </div>
                     } 
                   />
                   <Button 
                    type="primary" 
                    size="large"
                    block
                    style={{ marginTop: '20px', borderRadius: '8px', fontWeight: 600, height: '40px' }}
                    onClick={() => handleAddToCart(p.id)}
                   >
                     Add to Cart
                   </Button>
                 </Card>
               </Col>
             ))}
        </Row>
      </Content>

      <Footer style={{ background: '#f8fafc', color: '#475569', padding: '80px 16px 40px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1677ff', marginBottom: '20px', letterSpacing: '-1px' }}>ExpressCart</div>
              <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6 }}>
                Your premium destination for high-quality electronics and accessories. Experience the future of online shopping today.
              </Paragraph>
            </Col>
            <Col xs={12} md={4}>
              <Title level={5} style={{ color: '#1e293b', marginBottom: '24px' }}>Quick Links</Title>
              <Space direction="vertical" size="middle">
                <Link href="/products" style={{ color: '#64748b' }}>Shop All</Link>
                <Link href="/profile" style={{ color: '#64748b' }}>My Account</Link>
                <Link href="/register" style={{ color: '#64748b' }}>Join Us</Link>
              </Space>
            </Col>
            <Col xs={12} md={4}>
              <Title level={5} style={{ color: '#1e293b', marginBottom: '24px' }}>Customer Support</Title>
              <Space direction="vertical" size="middle">
                <Text style={{ color: '#64748b' }}>Help Center</Text>
                <Text style={{ color: '#64748b' }}>Track Order</Text>
                <Text style={{ color: '#64748b' }}>Return Policy</Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5} style={{ color: '#1e293b', marginBottom: '24px' }}>Newsletter</Title>
              <Paragraph style={{ color: '#64748b' }}>Stay updated with our latest offers and products.</Paragraph>
              <Input.Search 
                placeholder="Your email address" 
                enterButton="Subscribe" 
                size="large" 
                style={{ marginTop: '12px' }}
              />
            </Col>
          </Row>
          <Divider style={{ borderColor: '#e2e8f0', margin: '48px 0 32px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Text type="secondary">© 2026 ExpressCart Inc. All rights reserved.</Text>
            <Space size="large">
              <Text type="secondary" style={{ cursor: 'pointer' }}>Privacy Policy</Text>
              <Text type="secondary" style={{ cursor: 'pointer' }}>Terms of Service</Text>
            </Space>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}
