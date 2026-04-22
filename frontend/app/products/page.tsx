'use client';
import { BASE_URI } from '@/constants/api';

import React, { useEffect, useState, Suspense } from 'react';
import { Layout, Menu, Typography, Row, Col, Card, Button, Input, Space, Spin, Divider, Select, Drawer, Pagination, message } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('none');
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  useEffect(() => {
    setSearch(initialSearch);
    setPage(1);
  }, [initialSearch]);

  const addToCart = async (productId: string) => {
    try {
      const res = await fetch(`${BASE_URI}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId, quantity: 1 }),
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
    <Content style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div 
          className="flex flex-col md:flex-row justify-between items-center gap-4" 
          style={{ marginBottom: '48px' }}
        >
            <div>
              <Title level={1} className="m-0 text-2xl md:text-3xl">
                {search ? `Results for "${search}"` : 'All Products'}
              </Title>
              {total > 0 && <Text type="secondary">{total} items found</Text>}
            </div>
            <Space className="w-full md:w-auto" direction="horizontal" wrap>
                <Input.Search 
                  placeholder="Search products..." 
                  defaultValue={initialSearch}
                  onSearch={(val) => { setSearch(val); setPage(1); }}
                  style={{ width: 200 }}
                />
                <Select defaultValue="all" className="w-full md:w-40" onChange={(val) => { setSelectedCategory(val); setPage(1); }}>
                    <Option value="all">All Categories</Option>
                    {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
                <Select defaultValue="none" className="w-full md:w-40" onChange={(val) => { setSortBy(val); setPage(1); }}>
                    <Option value="none">Sort By</Option>
                    <Option value="price-low">Price: Low to High</Option>
                    <Option value="price-high">Price: High to Low</Option>
                </Select>
            </Space>
        </div>
        <Row gutter={[16, 16]}>
             {loading ? <Col span={24} style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></Col> : products.map((p: any) => (
               <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
                 <Card 
                    hoverable 
                    cover={<img alt={p.name} src={p.images?.[0]?.url || 'https://via.placeholder.com/200'} style={{ height: '200px', objectFit: 'cover' }} />}
                 >
                   <Card.Meta 
                     title={<Link href={`/products/details?id=${p.id}`}>{p.name}</Link>} 
                     description={
                       <div>
                         <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3f51b5' }}>${p.price}</div>
                         {p.compareAtPrice && <Text delete style={{ fontSize: '12px' }}>${p.compareAtPrice}</Text>}
                       </div>
                     } 
                   />
                   <Button type="primary" style={{ marginTop: '16px', width: '100%' }} onClick={() => addToCart(p.id)}>Add to Cart</Button>
                 </Card>
               </Col>
             ))}
        </Row>
        <Pagination current={page} total={total} pageSize={limit} onChange={setPage} style={{ marginTop: '24px', textAlign: 'center' }} />
      </Content>
  );
}

export default function AllProductsPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>}>
        <ProductsContent />
      </Suspense>
      <Footer style={{ background: '#f8fafc', color: '#475569', padding: '64px 16px 32px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">© 2026 ExpressCart Inc. All rights reserved.</Typography.Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}
