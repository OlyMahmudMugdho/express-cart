'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout, Form, Input, InputNumber, Button, Typography, message, Spin } from 'antd';
import Navbar from '@/components/Navbar';
import { BASE_URI } from '@/constants/api';

const { Content } = Layout;
const { Title } = Typography;

function EditProductForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URI}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        form.setFieldsValue(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        message.error('Failed to load product');
        setLoading(false);
      });
  }, [id, form]);

  const onFinish = async (values: any) => {
    const res = await fetch(`${BASE_URI}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success('Product updated');
      router.push('/inventory');
    } else {
      message.error('Failed to update');
    }
  };

  if (loading) return <Spin fullscreen />;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Content style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <Title level={2}>Edit Product</Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="name" label="Name"><Input /></Form.Item>
          <Form.Item name="price" label="Price"><InputNumber /></Form.Item>
          <Form.Item name="stockQuantity" label="Stock"><InputNumber /></Form.Item>
          <Button type="primary" htmlType="submit">Save</Button>
        </Form>
      </Content>
    </Layout>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<Spin fullscreen />}>
      <EditProductForm />
    </Suspense>
  );
}
