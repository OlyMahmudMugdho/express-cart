'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-layout';
import { Table, Button, message, Popconfirm, Modal, Form, Input, InputNumber } from 'antd';
import { BASE_URI } from '@/constants/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch(`${BASE_URI}/categories`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
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
        message.success('Category saved');
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
    { title: 'Name', dataIndex: 'name' },
    { title: 'Slug', dataIndex: 'slug' },
    { title: 'Action', render: (_: any, record: any) => (
        <>
            <Button onClick={() => { setEditingId(record.id); form.setFieldsValue(record); setIsModalVisible(true); }} style={{marginRight: 8}}>Edit</Button>
            <Popconfirm title="Delete?" onConfirm={() => deleteCategory(record.id)}>
                <Button danger>Delete</Button>
            </Popconfirm>
        </>
    )}
  ];

  return (
    <AdminLayout>
      <Button type="primary" onClick={() => { setEditingId(null); form.resetFields(); setIsModalVisible(true); }} style={{ marginBottom: 16 }}>Add Category</Button>
      <Table dataSource={categories} columns={columns} rowKey="id" />
      <Modal title={editingId ? "Edit Category" : "Add Category"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
