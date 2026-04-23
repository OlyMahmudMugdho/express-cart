'use client';

import { BASE_URI } from '@/constants/api';
import React, { useEffect, useState, Suspense } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Button, 
  Input, 
  Space, 
  Spin, 
  Select, 
  Pagination, 
  message, 
  Badge,
  Breadcrumb,
  Divider
} from 'antd';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronRight,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useSearchParams, useRouter } from 'next/navigation';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('none');
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    setSearch(initialSearch);
    setPage(1);
  }, [initialSearch]);

  const addToCart = async (productId: string) => {
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        message.success('Added to cart');
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        message.error('Failed to add to cart');
      }
    } catch (e) {
      console.error(e);
      message.error('An error occurred');
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(selectedCategory !== 'all' && { categoryId: selectedCategory }),
          ...(search && { search }),
          ...(sortBy === 'price-low' && { sort: 'price_asc' }),
          ...(sortBy === 'price-high' && { sort: 'price_desc' }),
        });

        const [prodRes, catRes] = await Promise.all([
          fetch(`${BASE_URI}/products?${query}`),
          fetch(`${BASE_URI}/categories`)
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(Array.isArray(prodData.products) ? prodData.products : []);
        setTotal(prodData.total || 0);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [page, selectedCategory, sortBy, search]);

  return (
    <Content style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Breadcrumb 
          style={{ marginBottom: '32px' }}
          items={[
            { title: <Link href="/" style={{ color: '#64748b' }}>Home</Link> },
            { title: <Text strong>Shop All</Text> }
          ]} 
        />

        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <Title level={1} style={{ margin: '0 0 8px 0', fontSize: 'clamp(28px, 4vw, 40px)' }}>
                {search ? `Results for "${search}"` : 'All Products'}
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Showing {products.length} of {total} premium essentials
              </Text>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: 'none', justifyContent: 'flex-start' }} className="md:w-auto">
                <Input 
                  placeholder="Search..." 
                  defaultValue={initialSearch}
                  onPressEnter={(e: any) => { setSearch(e.target.value); setPage(1); }}
                  prefix={<Search size={16} style={{ color: '#94a3b8' }} />}
                  style={{ width: '100%', maxWidth: '240px', borderRadius: '4px', height: '40px' }}
                  className="search-input"
                />
                <Select 
                  defaultValue="all" 
                  style={{ width: '100%', maxWidth: '180px', height: '40px' }} 
                  onChange={(val) => { setSelectedCategory(val); setPage(1); }}
                  suffixIcon={<SlidersHorizontal size={14} />}
                >
                    <Option value="all">All Categories</Option>
                    {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
                <Select 
                  defaultValue="none" 
                  style={{ width: '100%', maxWidth: '180px', height: '40px' }} 
                  onChange={(val) => { setSortBy(val); setPage(1); }}
                >
                    <Option value="none">Sort By</Option>
                    <Option value="price-low">Price: Low to High</Option>
                    <Option value="price-high">Price: High to Low</Option>
                </Select>
            </div>
          </div>
        </div>

        <Divider style={{ margin: '0 0 48px 0', borderColor: '#f1f5f9' }} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#64748b' }}>Curating products...</div>
          </div>
        ) : (
          <>
            <Row gutter={[16, 40]}>
              {products.length > 0 ? products.map((p: any) => (
                <Col xs={12} sm={12} md={8} lg={6} key={p.id}>
                  <div className="product-card-hover" style={{ height: '100%' }}>
                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', background: '#f8fafc', marginBottom: '16px' }}>
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
                      <div className="product-action-btn" style={{ 
                        position: 'absolute', 
                        bottom: '12px', 
                        left: '12px', 
                        right: '12px',
                        opacity: 0,
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                      }}>
                        <Button 
                          type="primary" 
                          block 
                          onClick={() => addToCart(p.id)}
                          style={{ borderRadius: '4px', height: '36px', fontWeight: 600, fontSize: '13px' }}
                        >
                          Quick Add
                        </Button>
                      </div>
                    </div>
                    <div style={{ padding: '0 4px' }}>
                      <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>{p.category?.name}</Text>
                      <Title level={5} style={{ margin: '0 0 6px 0', fontSize: '16px', lineHeight: 1.4, height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        <Link href={`/products/details?id=${p.id}`} style={{ color: '#1e293b' }}>{p.name}</Link>
                      </Title>
                      <Space size={6}>
                        <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>${Number(p.price).toFixed(2)}</Text>
                        {p.compareAtPrice && <Text delete style={{ fontSize: '13px', color: '#94a3b8' }}>${Number(p.compareAtPrice).toFixed(2)}</Text>}
                      </Space>
                    </div>
                  </div>
                </Col>
              )) : (
                <Col span={24}>
                  <div style={{ textAlign: 'center', padding: '100px 0', background: '#f8fafc', borderRadius: '12px' }}>
                    <Search size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                    <Title level={4} style={{ color: '#64748b' }}>No products found</Title>
                    <Paragraph type="secondary">Try adjusting your filters or search terms.</Paragraph>
                    <Button type="link" onClick={() => { setSearch(''); setSelectedCategory('all'); setPage(1); }}>Clear all filters</Button>
                  </div>
                </Col>
              )}
            </Row>
            
            <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
              <Pagination 
                current={page} 
                total={total} 
                pageSize={limit} 
                onChange={setPage} 
                showSizeChanger={false}
                className="elegant-pagination"
              />
            </div>
          </>
        )}
      </Content>
  );
}

export default function AllProductsPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>}>
        <ProductsContent />
      </Suspense>
      <Footer style={{ background: '#fff', color: '#94a3b8', padding: '60px 24px 40px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Text style={{ color: '#94a3b8', fontSize: '14px' }}>© 2026 ExpressCart Inc. Crafted for the modern digital lifestyle.</Text>
        </div>
      </Footer>
      <style jsx global>{`
        .product-card-hover:hover .product-action-btn {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        .elegant-pagination .ant-pagination-item {
          border-radius: 4px;
          border-color: #f1f5f9;
        }
        
        .elegant-pagination .ant-pagination-item-active {
          background: #1e293b;
          border-color: #1e293b;
        }
        
        .elegant-pagination .ant-pagination-item-active a {
          color: #fff !important;
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
