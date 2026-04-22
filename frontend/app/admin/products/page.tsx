'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-layout';
import { Table, Button, message, Popconfirm, Modal, Form, Input, InputNumber, Upload, Space, Tabs, Typography, Tag, Image as AntImage } from 'antd';
import { UploadOutlined, LinkOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BASE_URI } from '@/constants/api';

const { Title, Text } = Typography;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch(`${BASE_URI}/products`);
    const data = await res.json();
    setProducts(data.products || []);
  };

  const handleSave = async (values: any) => {
    const url = editingId ? `${BASE_URI}/products/${editingId}` : `${BASE_URI}/products`;
    const method = editingId ? 'PATCH' : 'POST';
    
    // Combine uploaded files and manual URLs
    let finalImages: any[] = [];
    if (values.imageUrls) {
      finalImages = values.imageUrls.split(',').map((url: string) => ({ url: url.trim(), isPrimary: false }));
    }
    
    fileList.forEach(file => {
      if (file.status === 'done' && file.response?.url) {
        finalImages.push({ url: file.response.url, isPrimary: false });
      } else if (file.url) {
        // Keep existing images when editing
        finalImages.push({ url: file.url, isPrimary: false });
      }
    });

    if (finalImages.length > 0) {
      finalImages[0].isPrimary = true;
    }

    const payload = { ...values, images: finalImages };
    delete payload.imageUrls;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
        message.success('Product saved successfully');
        setIsModalVisible(false);
        fetchProducts();
    } else {
        const errData = await res.json();
        message.error(errData.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`${BASE_URI}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      message.success('Product deleted');
      fetchProducts();
    }
  };

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: any) => (
        <Space>
          <AntImage
            src={record.images?.[0]?.url || 'https://via.placeholder.com/40'}
            width={40}
            height={40}
            style={{ borderRadius: '4px', objectFit: 'cover' }}
            fallback="https://via.placeholder.com/40"
          />
          <div>
            <Text strong style={{ display: 'block' }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.sku || 'No SKU'}</Text>
          </div>
        </Space>
      ),
    },
    { 
      title: 'Price', 
      dataIndex: 'price', 
      key: 'price',
      render: (price: number) => <Text strong>${Number(price).toFixed(2)}</Text>
    },
    { 
      title: 'Stock', 
      dataIndex: 'stockQuantity', 
      key: 'stockQuantity',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'success' : stock > 0 ? 'warning' : 'error'}>
          {stock} in stock
        </Tag>
      )
    },
    { 
      title: 'Action', 
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => { 
                setEditingId(record.id); 
                form.setFieldsValue({
                    ...record,
                    imageUrls: record.images?.map((i: any) => i.url).join(', ')
                }); 
                setFileList(record.images?.map((i: any, index: number) => ({
                    uid: `-${index}`,
                    name: `image-${index}`,
                    status: 'done',
                    url: i.url,
                })) || []);
                setIsModalVisible(true); 
            }} />
            <Popconfirm title="Delete this product?" onConfirm={() => deleteProduct(record.id)} okText="Yes" cancelText="No">
                <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
    )}
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Product Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => { setEditingId(null); form.resetFields(); setFileList([]); setIsModalVisible(true); }}
        >
          Add Product
        </Button>
      </div>
      
      <Table 
        dataSource={products} 
        columns={columns} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff' }}
      />

      <Modal title={editingId ? "Edit Product" : "Add Product"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Space style={{ width: '100%' }} direction="vertical" size={0}>
            <Form.Item name="name" label="Name" rules={[{required: true}]}><Input placeholder="Product name" /></Form.Item>
            <Form.Item name="slug" label="Slug" rules={[{required: true}]}><Input placeholder="product-url-slug" /></Form.Item>
            <Form.Item name="description" label="Description"><Input.TextArea rows={3} placeholder="Detailed product description" /></Form.Item>
            
            <Space size={16} style={{ width: '100%' }}>
              <Form.Item name="price" label="Price" rules={[{required: true}]}><InputNumber prefix="$" style={{width: 180}} /></Form.Item>
              <Form.Item name="compareAtPrice" label="Compare At Price"><InputNumber prefix="$" style={{width: 180}} /></Form.Item>
            </Space>

            <Space size={16} style={{ width: '100%' }}>
              <Form.Item name="stockQuantity" label="Stock" rules={[{required: true}]}><InputNumber style={{width: 180}} /></Form.Item>
              <Form.Item name="sku" label="SKU"><Input style={{width: 180}} placeholder="Stock Keeping Unit" /></Form.Item>
            </Space>
          </Space>
          
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Product Images</label>
            <Tabs defaultActiveKey="1" items={[
              {
                key: '1',
                label: <span><UploadOutlined /> Upload</span>,
                children: (
                  <Upload
                    action={`${BASE_URI}/media/upload`}
                    headers={{ 
                      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}` 
                    }}
                    name="file"
                    listType="picture-card"
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                  >
                    {fileList.length >= 8 ? null : <div><UploadOutlined /><div>Upload</div></div>}
                  </Upload>
                ),
              },
              {
                key: '2',
                label: <span><LinkOutlined /> URL</span>,
                children: (
                  <Form.Item name="imageUrls" help="Comma separated list of URLs">
                    <Input.TextArea placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
                  </Form.Item>
                ),
              },
            ]} />
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
