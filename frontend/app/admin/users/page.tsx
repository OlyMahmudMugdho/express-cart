'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-layout';
import { Table, message, Tabs, Tag } from 'antd';
import { BASE_URI } from '@/constants/api';



export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    // Decode token to check role without needing a separate API call for now
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Current user role:', payload.role);
        } catch (e) {
            console.error('Error decoding token:', e);
        }
    }
    fetchUsers();
    fetchAdmins();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${BASE_URI}/users/customers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    console.log("Admins data:", data);
    if (!res.ok) console.error("Admins fetch error:", res.status, data);
    setUsers(data || []);
  };

  const fetchAdmins = async () => {
    const res = await fetch(`${BASE_URI}/users/admins`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    console.log("Admins data:", data);
    if (!res.ok) console.error("Admins fetch error:", res.status, data);
    setAdmins(data || []);
  };

  const columns = [
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: 'role' },
    { title: 'Status', dataIndex: 'isActive', render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag> },
  ];

  return (
    <AdminLayout>
      <Tabs defaultActiveKey="customers" items={[{key: "customers", label: "Customers", children: <Table dataSource={users} columns={columns} rowKey="id" />}, {key: "admins", label: "Admins", children: <Table dataSource={admins} columns={columns} rowKey="id" />}]} />
    </AdminLayout>
  );
}
