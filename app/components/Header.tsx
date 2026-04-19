'use client';
import React from 'react';
import Link from 'next/link';
import { Layout, Menu } from 'antd';
const { Header } = Layout;

export default function AppHeader(){
  return (
    <Header style={{display:'flex',alignItems:'center',gap:24}}>
      <div style={{color:'#fff',fontWeight:700}}>OmniCart</div>
      <Menu theme="dark" mode="horizontal" selectable={false} items={[
        { key: 'home', label: (<Link href="/">Home</Link>) },
        { key: 'catalog', label: (<Link href="/catalog">Catalog</Link>) },
        { key: 'auth', label: (<Link href="/auth">Auth</Link>) },
        { key: 'user', label: (<Link href="/user">Profile</Link>) },
        { key: 'checkout', label: (<Link href="/checkout">Checkout</Link>) },
      ]} />
    </Header>
  )
}
