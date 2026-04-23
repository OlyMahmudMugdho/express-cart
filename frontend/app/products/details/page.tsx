'use client';

import { BASE_URI } from '@/constants/api';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Layout, 
  Typography, 
  Button, 
  Spin, 
  Row, 
  Col, 
  Breadcrumb, 
  Space, 
  Divider, 
  message, 
  Tag,
  InputNumber,
  Badge,
  Input
} from 'antd';
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RefreshCcw, 
  Star,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

function ProductDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${BASE_URI}/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        console.error(e);
        message.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('Please login to add items to cart');
      router.push('/login');
      return;
    }
    
    setAdding(true);
    try {
      const res = await fetch(`${BASE_URI}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id, quantity }),
      });
      if (res.ok) {
        message.success('Added to your collection');
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        message.error('Failed to add to cart');
      }
    } catch (e) {
      console.error(e);
      message.error('An error occurred');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Spin fullscreen size="large" />;
  if (!product) return (
    <div style={{ padding: '100px 24px', textAlign: 'center' }}>
      <Title level={3}>Product not found</Title>
      <Button onClick={() => router.push('/products')}>Back to Shop</Button>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />

      <Content style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <Button 
            type="link" 
            icon={<ArrowLeft size={16} />} 
            onClick={() => router.push('/products')}
            style={{ padding: 0, color: '#64748b', display: 'flex', alignItems: 'center', marginBottom: '24px' }}
          >
            Back to Collection
          </Button>
          <Breadcrumb 
            items={[
              { title: <Link href="/" style={{ color: '#64748b' }}>Home</Link> },
              { title: <Link href="/products" style={{ color: '#64748b' }}>Shop</Link> },
              { title: <Text strong>{product.name}</Text> }
            ]} 
          />
        </div>

        <Row gutter={[64, 64]} align="top">
          <Col xs={24} md={12}>
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{ 
                borderRadius: '12px', 
                overflow: 'hidden', 
                background: '#f8fafc',
                position: 'relative'
              }}>
                <img 
                  src={product.images?.[0]?.url || 'https://via.placeholder.com/600'} 
                  alt={product.name} 
                  style={{ width: '100%', height: 'auto', display: 'block' }} 
                />
                {product.compareAtPrice && (
                  <Badge.Ribbon text="Exclusive Offer" color="#f5222d" style={{ top: '20px' }} />
                )}
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ maxWidth: '500px' }}>
              <Tag color="blue" style={{ marginBottom: '16px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{product.category?.name}</Tag>
              <Title level={1} style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px', lineHeight: 1.1 }}>{product.name}</Title>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '8px' }}>
                <Space size={2}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
                </Space>
                <Text type="secondary" style={{ fontSize: '14px' }}>(48 Verified Reviews)</Text>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                  <Title level={2} style={{ color: '#1677ff', margin: 0, fontSize: '36px' }}>${Number(product.price).toFixed(2)}</Title>
                  {product.compareAtPrice && (
                    <Text delete type="secondary" style={{ fontSize: '20px' }}>${Number(product.compareAtPrice).toFixed(2)}</Text>
                  )}
                </div>
                <Text type="success" style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <Check size={14} style={{ marginRight: '4px' }} /> In Stock: {product.stockQuantity} pieces available
                </Text>
              </div>

              <Paragraph style={{ fontSize: '16px', color: '#475569', lineHeight: 1.8, marginBottom: '40px' }}>
                {product.description || "A masterclass in design and performance. This piece combines premium materials with cutting-edge technology to deliver an unparalleled experience."}
              </Paragraph>

              <Divider style={{ margin: '40px 0' }} />

              <div style={{ marginBottom: '40px' }}>
                <Text strong style={{ display: 'block', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Quantity</Text>
                <Space size="middle">
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '4px',
                    padding: '4px'
                  }}>
                    <Button 
                      type="text" 
                      icon={<Minus size={16} />} 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    />
                    <Text strong style={{ width: '40px', textAlign: 'center', fontSize: '16px' }}>{quantity}</Text>
                    <Button 
                      type="text" 
                      icon={<Plus size={16} />} 
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} 
                    />
                  </div>
                </Space>
              </div>

              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCart size={20} />} 
                loading={adding}
                disabled={product.stockQuantity === 0} 
                onClick={addToCart}
                className="btn-elegant"
                style={{ height: '56px', padding: '0 40px', borderRadius: '4px', fontSize: '16px', fontWeight: 600, width: '100%' }}
              >
                {product.stockQuantity > 0 ? 'Add to Collection' : 'Sold Out'}
              </Button>

              <div style={{ marginTop: '64px' }}>
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <Space align="start" size="middle">
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', color: '#1677ff' }}>
                        <Truck size={24} />
                      </div>
                      <div>
                        <Text strong style={{ display: 'block' }}>Complimentary Shipping</Text>
                        <Text type="secondary" style={{ fontSize: '14px' }}>On all orders above $100. Delivery within 2-4 business days.</Text>
                      </div>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space align="start" size="middle">
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', color: '#1677ff' }}>
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <Text strong style={{ display: 'block' }}>2-Year Warranty</Text>
                        <Text type="secondary" style={{ fontSize: '14px' }}>Complete protection and authentic certification included.</Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Content>

      <Footer style={{ background: '#f8fafc', color: '#475569', padding: '80px 24px 40px', borderTop: '1px solid #f1f5f9', marginTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', letterSpacing: '-0.02em' }}>ExpressCart</div>
              <Paragraph style={{ color: '#64748b', fontSize: '15px' }}>
                Curating the world's most refined electronics for the modern professional. Quality and aesthetic without compromise.
              </Paragraph>
            </Col>
            <Col xs={12} md={4}>
              <Title level={5} style={{ color: '#1e293b' }}>Shop</Title>
              <Space direction="vertical" size="small">
                <Link href="/products" style={{ color: '#64748b' }}>Collections</Link>
                <Link href="/products" style={{ color: '#64748b' }}>New Arrivals</Link>
              </Space>
            </Col>
            <Col xs={12} md={4}>
              <Title level={5} style={{ color: '#1e293b' }}>Support</Title>
              <Space direction="vertical" size="small">
                <Text style={{ color: '#64748b' }}>Help Center</Text>
                <Text style={{ color: '#64748b' }}>Track Order</Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5} style={{ color: '#1e293b' }}>Stay Inspired</Title>
              <Paragraph style={{ color: '#64748b' }}>Subscribe for early access to collection drops.</Paragraph>
              <Input.Search placeholder="Email address" enterButton="Join" size="large" />
            </Col>
          </Row>
          <Divider style={{ borderColor: '#e2e8f0', margin: '48px 0 32px' }} />
          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">© 2026 ExpressCart Inc. Crafted with precision.</Typography.Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<Spin fullscreen size="large" />}>
      <ProductDetailsContent />
    </Suspense>
  );
}
