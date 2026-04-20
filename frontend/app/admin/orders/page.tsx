'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-layout';
import { Table, Select, message, Tag } from 'antd';
import { BASE_URI } from '@/constants/api';

const { Option } = Select;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${BASE_URI}/checkout/all-orders`, { // Need to ensure this exists or use a new endpoint
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setOrders(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`${BASE_URI}/checkout/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
        message.success('Status updated');
        fetchOrders();
    }
  };

  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber' },
    { title: 'Total', dataIndex: 'total' },
    { title: 'Status', render: (_: any, record: any) => (
        <Select defaultValue={record.status} onChange={(val) => updateStatus(record.id, val)}>
            <Option value="pending">Pending</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
        </Select>
    )}
  ];

  return (
    <AdminLayout>
      <Table dataSource={orders} columns={columns} rowKey="id" />
    </AdminLayout>
  );
}
