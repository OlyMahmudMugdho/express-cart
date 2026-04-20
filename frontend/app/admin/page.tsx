'use client';

import React from 'react';
import AdminLayout from './admin-layout';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminPage() {
  return (
    <AdminLayout>
      <Title level={2}>Welcome to the Admin Dashboard</Title>
    </AdminLayout>
  );
}
