'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-layout';
import { Table, Select, message, Tag, Typography, Space, Card, Button } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { BASE_URI } from '@/constants/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URI}/checkout/all-orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setOrders(data || []);
    } catch (e) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${BASE_URI}/checkout/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
          message.success('Order status updated successfully');
          fetchOrders();
      } else {
          message.error('Failed to update status');
      }
    } catch (e) {
      message.error('An error occurred');
    }
  };

  const getStatusTag = (status: string) => {
    let color = 'default';
    if (status === 'delivered') color = 'success';
    if (status === 'processing' || status === 'shipped') color = 'processing';
    if (status === 'pending') color = 'warning';
    if (status === 'cancelled') color = 'error';
    return <Tag color={color}>{status.toUpperCase()}</Tag>;
  };

  const columns = [
    { 
      title: 'Order ID', 
      dataIndex: 'orderNumber', 
      key: 'orderNumber',
      render: (text: string) => <Text strong>{text}</Text>
    },
    { 
      title: 'Date', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    { 
      title: 'Total Amount', 
      dataIndex: 'total', 
      key: 'total',
      render: (total: number) => <Text strong>${Number(total).toFixed(2)}</Text>
    },
    { 
      title: 'Current Status', 
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    { 
      title: 'Update Status', 
      key: 'update_status',
      render: (_: any, record: any) => (
        <Select 
          defaultValue={record.status} 
          style={{ width: 140 }}
          onChange={(val) => updateStatus(record.id, val)}
          size="small"
        >
            <Option value="pending">Pending</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
        </Select>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button type="text" icon={<EyeOutlined />} disabled>Details</Button>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Order Management</Title>
        <Text type="secondary">Monitor and manage customer orders</Text>
      </div>

      <Table 
        dataSource={orders} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff' }}
      />
    </AdminLayout>
  );
}
