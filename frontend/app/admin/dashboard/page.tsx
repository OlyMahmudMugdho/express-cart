'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Spin } from 'antd';
import AdminLayout from '../AdminLayout';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) return <Spin size="large" />;

  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel.</p>
    </AdminLayout>
  );
}
