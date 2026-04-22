'use client';
import { BASE_URI } from '@/constants/api';

import React, { useEffect, useState } from 'react';
import { Layout, Table, Button, Space, Typography, Tag } from 'antd';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const { Content } = Layout;
const { Title } = Typography;

export default function InventoryDashboard() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(BASE_URI + '/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Stock', dataIndex: 'stockQuantity', key: 'stockQuantity' },
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Action', key: 'action', render: (_: any, record: any) => <Link href={`/inventory/edit?id=${record.id}`}>Edit</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Content style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Title level={2}>Inventory</Title>
        <Table dataSource={products} columns={columns} rowKey="id" />
      </Content>
    </Layout>
  );
}
