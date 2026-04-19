'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Form, Input } from 'antd';
import api from '../../../lib/api';
import AdminLayout from '../AdminLayout';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await api.get('/products');
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Price', dataIndex: 'price' },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = async (values: any) => {
    try {
      await api.post('/admin/products', values);
      message.success('Product added successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchProducts();
    } catch (err) {
      message.error('Failed to add product');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Inventory</h1>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>Add Product</Button>
      </div>
      <Table dataSource={products} columns={columns} loading={loading} rowKey="id" />
      
      <Modal title="Add Product" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
