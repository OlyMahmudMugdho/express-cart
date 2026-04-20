'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-layout';
import { Table, Button, message, Popconfirm, Modal, Form, Input, InputNumber, Upload, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { BASE_URI } from '@/constants/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch(`${BASE_URI}/products`);
    const data = await res.json();
    setProducts(data.products || []);
  };

  const handleSave = async (values: any) => {
    // Basic image handling: If upload was used, we might need a different flow.
    // For now, allow a comma-separated list of URLs if uploading is not fully integrated.
    const payload = { ...values };
    if (typeof payload.images === 'string') {
        payload.images = payload.images.split(',').map((url: string) => ({ url: url.trim(), isPrimary: true }));
    }

    const url = editingId ? `${BASE_URI}/products/${editingId}` : `${BASE_URI}/products`;
    const method = editingId ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
        message.success('Saved');
        setIsModalVisible(false);
        fetchProducts();
    } else {
        message.error('Failed to save');
    }
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`${BASE_URI}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      message.success('Deleted');
      fetchProducts();
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Price', dataIndex: 'price' },
    { title: 'Action', render: (_: any, record: any) => (
        <Space>
            <Button onClick={() => { 
                setEditingId(record.id); 
                form.setFieldsValue({
                    ...record,
                    images: record.images?.map((i: any) => i.url).join(', ')
                }); 
                setIsModalVisible(true); 
            }}>Edit</Button>
            <Popconfirm title="Delete?" onConfirm={() => deleteProduct(record.id)}>
                <Button danger>Delete</Button>
            </Popconfirm>
        </Space>
    )}
  ];

  return (
    <AdminLayout>
      <Button type="primary" onClick={() => { setEditingId(null); form.resetFields(); setIsModalVisible(true); }} style={{ marginBottom: 16 }}>Add Product</Button>
      <Table dataSource={products} columns={columns} rowKey="id" />
      <Modal title={editingId ? "Edit Product" : "Add Product"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
          <Form.Item name="price" label="Price" rules={[{required: true}]}><InputNumber style={{width: '100%'}} /></Form.Item>
          <Form.Item name="compareAtPrice" label="Compare At Price"><InputNumber style={{width: '100%'}} /></Form.Item>
          <Form.Item name="stockQuantity" label="Stock" rules={[{required: true}]}><InputNumber style={{width: '100%'}} /></Form.Item>
          <Form.Item name="sku" label="SKU"><Input /></Form.Item>
          <Form.Item name="images" label="Product Image URLs (comma separated)">
            <Input.TextArea placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
