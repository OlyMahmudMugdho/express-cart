'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-layout';
import { Table, message, Tabs, Tag, Typography, Avatar, Space } from 'antd';
import { UserOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';
import { BASE_URI } from '@/constants/api';

const { Title, Text } = Typography;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchAdmins()]);
    } catch (e) {
      message.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch(`${BASE_URI}/users/customers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setUsers(data || []);
  };

  const fetchAdmins = async () => {
    const res = await fetch(`${BASE_URI}/users/admins`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setAdmins(data || []);
  };

  const columns = [
    { 
      title: 'User', 
      key: 'user',
      render: (_: any, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.role === 'admin' ? '#f5222d' : '#1677ff' }} />
          <div>
            <Text strong style={{ display: 'block' }}>{record.email}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.id.slice(0, 8)}...</Text>
          </div>
        </Space>
      )
    },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' || role === 'superadmin' ? 'gold' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ) 
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A'
    }
  ];

  const tabItems = [
    {
      key: 'customers',
      label: (
        <span>
          <TeamOutlined />
          Customers
        </span>
      ),
      children: (
        <Table 
          dataSource={users} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ background: '#fff' }}
        />
      ),
    },
    {
      key: 'admins',
      label: (
        <span>
          <CrownOutlined />
          Administrators
        </span>
      ),
      children: (
        <Table 
          dataSource={admins} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ background: '#fff' }}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>User Management</Title>
        <Text type="secondary">Manage customer accounts and administrative access</Text>
      </div>

      <Tabs 
        defaultActiveKey="customers" 
        items={tabItems}
        type="card"
        style={{ marginTop: 16 }}
      />
    </AdminLayout>
  );
}
