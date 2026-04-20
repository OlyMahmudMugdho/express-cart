'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Button, Space, Drawer } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Header } = Layout;

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 1000 }}>
      <Link href="/" style={{ fontSize: '18px', fontWeight: 'bold', color: '#1677ff' }}>ExpressCart</Link>
      
      {isMobile ? (
        <Space size="small">
          <Input placeholder="Search" prefix={<SearchOutlined />} style={{ width: '80px' }} />
          <Button icon={<ShoppingCartOutlined />} type="text" />
          <Button icon={<MenuOutlined />} onClick={() => setIsDrawerOpen(true)} type="text" />
        </Space>
      ) : (
        <>
          <Menu mode="horizontal" style={{ flex: 1, border: 'none', justifyContent: 'center' }} items={[{ key: 'shop', label: <Link href="/products">Shop</Link> }, { key: 'deals', label: 'Deals' }]} />
          <Space size="small">
            <Input placeholder="Search" prefix={<SearchOutlined />} style={{ width: '150px' }} />
            <Button icon={<ShoppingCartOutlined />} type="text" />
          </Space>
        </>
      )}

      {isMobile && (
        <Drawer title="Menu" placement="right" onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen} width={250}>
          <Menu mode="vertical" onClick={() => setIsDrawerOpen(false)} items={[{ key: 'shop', label: <Link href="/products">Shop</Link> }, { key: 'deals', label: 'Deals' }]} />
        </Drawer>
      )}
    </Header>
  );
}
