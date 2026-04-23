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
  Tag,
  Badge,
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BASE_URI } from '@/constants/api';
import { 
  ShieldCheck, 
  Truck, 
  RefreshCcw, 
  Headphones, 
  ArrowRight,
  Star,
  ChevronRight
} from 'lucide-react';

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

interface Category {
  id: string;
  name: string;
}

const TrustSignal = ({ icon: Icon, title, description }: any) => (
  <div style={{ textAlign: 'center', padding: '24px' }}>
    <div style={{ 
      width: '64px', 
      height: '64px', 
      borderRadius: '50%', 
      background: '#f8fafc', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      margin: '0 auto 16px',
      color: '#1677ff'
    }}>
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <Title level={5} style={{ marginBottom: '8px', fontSize: '16px' }}>{title}</Title>
    <Text type="secondary" style={{ fontSize: '14px' }}>{description}</Text>
  </div>
);

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

      <Content>
        {/* Hero Section */}
        <section className="hero-gradient" style={{ padding: 'clamp(40px, 8vw, 80px) 0', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[48, 32]} align="middle">
              <Col xs={24} md={12} style={{ textAlign: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'left' }}>
                <Tag color="blue" style={{ marginBottom: '16px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>New Season Arrival</Tag>
                <Title level={1} style={{ fontSize: 'clamp(32px, 8vw, 64px)', marginBottom: '16px', lineHeight: 1.1 }}>
                  Refined Tech for Your <br/>
                  <span style={{ color: '#1677ff' }}>Digital Lifestyle</span>
                </Title>
                <Paragraph style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: '#64748b', marginBottom: '32px', maxWidth: '500px', lineHeight: 1.6, margin: typeof window !== 'undefined' && window.innerWidth < 768 ? '0 auto 32px' : '0 0 32px' }}>
                  Discover a curated collection of premium electronics designed to blend seamlessly with your modern aesthetic.
                </Paragraph>
                <Space size="middle" direction={typeof window !== 'undefined' && window.innerWidth < 480 ? 'vertical' : 'horizontal'} style={{ width: '100%', justifyContent: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'flex-start' }}>
                  <Button 
                    type="primary" 
                    size="large" 
                    className="btn-elegant"
                    onClick={() => router.push('/products')} 
                    style={{ height: '56px', padding: '0 40px', borderRadius: '4px', fontSize: '16px', fontWeight: 600, width: typeof window !== 'undefined' && window.innerWidth < 480 ? '100%' : 'auto' }}
                  >
                    Shop Collection
                  </Button>
                  <Button 
                    type="link" 
                    size="large" 
                    onClick={() => router.push('/products')} 
                    style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    View All Products <ChevronRight size={20} style={{ marginLeft: '4px' }} />
                  </Button>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ position: 'relative', marginTop: typeof window !== 'undefined' && window.innerWidth < 768 ? '24px' : '0' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '-10%', 
                    right: '-10%', 
                    width: '120%', 
                    height: '120%', 
                    background: 'radial-gradient(circle, rgba(22,119,255,0.08) 0%, transparent 70%)',
                    zIndex: 0
                  }} />
                  <img 
                    src="/assets/banner.jpg" 
                    alt="Hero Banner" 
                    className="animate-float"
                    style={{ 
                      width: '100%', 
                      maxHeight: 'clamp(300px, 50vw, 550px)', 
                      objectFit: 'cover', 
                      borderRadius: '8px', 
                      boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.15)',
                      position: 'relative',
                      zIndex: 1
                    }} 
                  />
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Trust Signals */}
        <section style={{ padding: '60px 0', background: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[24, 24]}>
              <Col xs={12} md={6}>
                <TrustSignal 
                  icon={Truck} 
                  title="Fast Delivery" 
                  description="Free shipping on orders over $100" 
                />
              </Col>
              <Col xs={12} md={6}>
                <TrustSignal 
                  icon={ShieldCheck} 
                  title="Secure Payment" 
                  description="100% secure payment processing" 
                />
              </Col>
              <Col xs={12} md={6}>
                <TrustSignal 
                  icon={RefreshCcw} 
                  title="Easy Returns" 
                  description="30-day money back guarantee" 
                />
              </Col>
              <Col xs={12} md={6}>
                <TrustSignal 
                  icon={Headphones} 
                  title="Expert Support" 
                  description="24/7 customer service available" 
                />
              </Col>
            </Row>
          </div>
        </section>

        {/* Featured Categories */}
        <section style={{ padding: '80px 0', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
              <Title level={2} style={{ fontSize: '36px', marginBottom: '16px' }}>Curated Collections</Title>
              <Paragraph style={{ color: '#64748b', fontSize: '16px' }}>Explore our hand-picked selections of premium essentials.</Paragraph>
            </div>
            
            <Row gutter={[16, 16]}>
              {loading ? <Col span={24} style={{ textAlign: 'center' }}><Spin size="large" /></Col> : categories.slice(0, 3).map((c, idx) => (
                <Col xs={idx === 0 ? 24 : 12} md={idx === 0 ? 12 : 6} key={c.id}>
                  <div 
                    onClick={() => router.push(`/products?category=${c.id}`)}
                    style={{ 
                      height: 'clamp(200px, 40vw, 400px)', 
                      background: idx === 0 ? '#1e293b' : '#fff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    className="product-card-hover"
                  >
                    <div style={{ padding: 'clamp(20px, 4vw, 40px)', position: 'relative', zIndex: 2 }}>
                      <Title level={3} style={{ color: idx === 0 ? '#fff' : '#1e293b', marginBottom: '8px', fontSize: 'clamp(18px, 3vw, 24px)' }}>{c.name}</Title>
                      <Text style={{ color: idx === 0 ? '#94a3b8' : '#64748b', fontSize: 'clamp(11px, 2vw, 14px)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Explore Series</Text>
                      <div style={{ marginTop: 'clamp(12px, 3vw, 24px)' }}>
                        <Button shape="circle" size={typeof window !== 'undefined' && window.innerWidth < 768 ? 'small' : 'middle'} icon={<ArrowRight size={16} />} style={{ border: 'none', background: idx === 0 ? '#1677ff' : '#f1f5f9', color: idx === 0 ? '#fff' : '#1e293b' }} />
                      </div>
                    </div>
                    {/* Decorative element or background pattern */}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '10px', 
                      right: '10px', 
                      fontSize: 'clamp(60px, 15vw, 120px)', 
                      fontWeight: 900, 
                      color: idx === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      userSelect: 'none',
                      lineHeight: 1
                    }}>
                      0{idx + 1}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Trending Products */}
        <section style={{ padding: '60px 0 100px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              justifyContent: 'space-between', 
              alignItems: 'flex-end', 
              marginBottom: '48px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <Title level={2} style={{ fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: '8px' }}>Trending Now</Title>
                <Paragraph style={{ color: '#64748b', margin: 0 }}>The pieces everyone is talking about.</Paragraph>
              </div>
              <Button 
                type="link" 
                onClick={() => router.push('/products')}
                style={{ fontWeight: 600, color: '#1677ff', fontSize: '16px', padding: '0' }}
              >
                View All Products →
              </Button>
            </div>

            <Row gutter={[16, 32]}>
                 {loading ? <Col span={24} style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></Col> : products.slice(0, 8).map((p: any) => (
                   <Col xs={12} sm={12} md={8} lg={6} key={p.id}>
                     <div className="product-card-hover" style={{ height: '100%' }}>
                        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', background: '#f8fafc', marginBottom: '12px' }}>
                          <Link href={`/products/details?id=${p.id}`}>
                            <img 
                              alt={p.name} 
                              src={p.images?.[0]?.url || 'https://via.placeholder.com/200'} 
                              style={{ height: 'clamp(180px, 30vw, 320px)', width: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          </Link>
                          {p.compareAtPrice && (
                            <Badge.Ribbon text="Sale" color="#f5222d" style={{ top: '12px' }} />
                          )}
                          <div style={{ 
                            position: 'absolute', 
                            bottom: '12px', 
                            left: '12px', 
                            right: '12px',
                            opacity: 0,
                            transform: 'translateY(10px)',
                            transition: 'all 0.3s ease',
                          }} className="product-action-btn">
                            <Button 
                              type="primary" 
                              block 
                              onClick={() => handleAddToCart(p.id)}
                              style={{ borderRadius: '4px', height: '36px', fontWeight: 600, fontSize: '13px' }}
                            >
                              Quick Add
                            </Button>
                          </div>
                        </div>
                        <div style={{ padding: '0 4px' }}>
                          <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', display: 'block' }}>{p.category?.name}</Text>
                          <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '14px', lineHeight: 1.4, height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            <Link href={`/products/details?id=${p.id}`} style={{ color: '#1e293b' }}>{p.name}</Link>
                          </Title>
                          <Space size={4} wrap>
                            <Text strong style={{ fontSize: '15px', color: '#1e293b' }}>${Number(p.price).toFixed(2)}</Text>
                            {p.compareAtPrice && <Text delete style={{ fontSize: '12px', color: '#94a3b8' }}>${Number(p.compareAtPrice).toFixed(2)}</Text>}
                          </Space>
                        </div>
                     </div>
                   </Col>
                 ))}
            </Row>
          </div>
        </section>

        {/* Newsletter / CTA Section */}
        <section style={{ padding: '100px 0', background: '#0f172a', color: '#fff' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <Title level={2} style={{ color: '#fff', fontSize: '40px', marginBottom: '24px' }}>Join the Inner Circle</Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px' }}>
              Be the first to know about new collection launches, exclusive events, and refined inspiration.
            </Paragraph>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <Input.Search 
                placeholder="Enter your email address" 
                enterButton="Subscribe" 
                size="large" 
                style={{ borderRadius: '4px' }}
                className="btn-elegant"
              />
            </div>
            <Text style={{ color: '#475569', fontSize: '12px', marginTop: '24px', display: 'block' }}>
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </Text>
          </div>
        </section>
      </Content>

      <Footer style={{ background: '#fff', color: '#1e293b', padding: '100px 24px 50px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', letterSpacing: '-0.02em' }}>ExpressCart</div>
              <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.8, maxWidth: '300px' }}>
                Curating the world's most refined electronics for the modern professional. Quality, performance, and aesthetic without compromise.
              </Paragraph>
              <Space size="large" style={{ marginTop: '24px' }}>
                {/* Social icons would go here */}
              </Space>
            </Col>
            <Col xs={12} md={4}>
              <Title level={5} style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>The Shop</Title>
              <Space direction="vertical" size="middle">
                <Link href="/products" style={{ color: '#64748b' }}>All Collections</Link>
                <Link href="/products" style={{ color: '#64748b' }}>New Arrivals</Link>
                <Link href="/products" style={{ color: '#64748b' }}>Featured Products</Link>
              </Space>
            </Col>
            <Col xs={12} md={4}>
              <Title level={5} style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer Care</Title>
              <Space direction="vertical" size="middle">
                <Text style={{ color: '#64748b' }}>Shipping Policy</Text>
                <Text style={{ color: '#64748b' }}>Track Your Order</Text>
                <Text style={{ color: '#64748b' }}>Returns & Exchanges</Text>
                <Text style={{ color: '#64748b' }}>Support Center</Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5} style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Visit Our Studio</Title>
              <Paragraph style={{ color: '#64748b', fontSize: '15px' }}>
                123 Design Avenue, Suite 456<br/>
                San Francisco, CA 94103<br/>
                hello@expresscart.com
              </Paragraph>
            </Col>
          </Row>
          <Divider style={{ borderColor: '#f1f5f9', margin: '60px 0 40px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <Text style={{ color: '#94a3b8', fontSize: '14px' }}>© 2026 ExpressCart Inc. Crafted with precision.</Text>
            <Space size="large">
              <Text style={{ color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>Privacy Policy</Text>
              <Text style={{ color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>Terms of Service</Text>
            </Space>
          </div>
        </div>
      </Footer>
      
      <style jsx global>{`
        .product-card-hover:hover .product-action-btn {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        @media (max-width: 768px) {
          .product-action-btn {
            opacity: 1 !important;
            transform: translateY(0) !important;
            position: relative !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            margin-top: 12px;
          }
        }
      `}</style>
    </Layout>
  );
}
