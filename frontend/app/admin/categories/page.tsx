'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-layout';
import { Table, Button, message, Popconfirm, Modal, Form, Input, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BASE_URI } from '@/constants/api';

const { Title, Text } = Typography;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URI}/categories`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    const url = editingId ? `${BASE_URI}/categories/${editingId}` : `${BASE_URI}/categories`;
    const method = editingId ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(values)
    });
    if (res.ok) {
        message.success('Category saved successfully');
        setIsModalVisible(false);
        fetchCategories();
    } else {
        message.error('Failed to save category');
    }
  };

  const deleteCategory = async (id: string) => {
    const res = await fetch(`${BASE_URI}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      message.success('Category deleted');
      fetchCategories();
    }
  };

  const columns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    { 
      title: 'Slug', 
      dataIndex: 'slug', 
      key: 'slug',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    { 
      title: 'Action', 
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => { setEditingId(record.id); form.setFieldsValue(record); setIsModalVisible(true); }} 
            />
            <Popconfirm title="Delete this category?" onConfirm={() => deleteCategory(record.id)} okText="Yes" cancelText="No">
                <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
    )}
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Category Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => { setEditingId(null); form.resetFields(); setIsModalVisible(true); }}
        >
          Add Category
        </Button>
      </div>

      <Table 
        dataSource={categories} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff' }}
      />

      <Modal 
        title={editingId ? "Edit Category" : "Add Category"} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{required: true}]}><Input placeholder="Category name" /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{required: true}]}><Input placeholder="category-slug" /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={4} placeholder="Category description" /></Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

import { Tag } from 'antd';
