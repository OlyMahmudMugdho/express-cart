'use client';

import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from './admin-layout';
import { 
  Typography, Row, Col, Card, Statistic, Table, Tag, Space, 
  Skeleton, Empty, Progress, List, Avatar, Badge, Tabs, Button, Select, Modal, Descriptions, message, Alert 
} from 'antd';
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FireOutlined,
  WarningOutlined,
  HistoryOutlined,
  TeamOutlined,
  ProjectOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Parser } from 'json2csv';
import { BASE_URI } from '@/constants/api';

const { Title, Text } = Typography;
const { Option } = Select;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URI}/dashboard/stats?period=${period}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const result = await res.json();
        console.log('Dashboard Data Success:', result);
        setData(result);
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to fetch statistics');
      }
    } catch (e: any) {
      console.error('Dashboard Fetch Error:', e);
      setError(e.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const showOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`${BASE_URI}/checkout/orders/${orderId}/details`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const orderData = await res.json();
        setSelectedOrder(orderData);
        setIsOrderModalVisible(true);
      }
    } catch (e) {
      message.error('Failed to load order details');
    }
  };

  const exportCSV = () => {
    if (!data?.recentOrders) return;
    try {
      const fields = ['orderNumber', 'total', 'status', 'createdAt', 'user.email'];
      const parser = new Parser({ fields });
      const csv = parser.parse(data.recentOrders);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Report exported successfully');
    } catch (err) {
      message.error('Failed to export CSV');
    }
  };

  const topLevelStats = useMemo(() => [
    {
      title: 'Total Revenue',
      value: data?.stats?.totalRevenue || 0,
      prefix: '$',
      icon: <DollarOutlined />,
      color: '#52c41a',
      subValue: `$${data?.stats?.periodRevenue || 0} this ${period.replace('ly', '')}`,
    },
    {
      title: 'Active Customers',
      value: data?.stats?.totalCustomers || 0,
      icon: <TeamOutlined />,
      color: '#1677ff',
      subValue: 'Verified users',
    },
    {
      title: 'Total Orders',
      value: data?.stats?.totalOrders || 0,
      icon: <ShoppingCartOutlined />,
      color: '#faad14',
      subValue: 'All time volume',
    },
    {
      title: 'Total Products',
      value: data?.stats?.totalProducts || 0,
      icon: <ProjectOutlined />,
      color: '#722ed1',
      subValue: `${data?.stats?.totalCategories || 0} Categories`,
    },
  ], [data, period]);

  const orderColumns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Customer',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => user?.email || 'Guest',
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => <Text strong>${Number(total).toFixed(2)}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'delivered') color = 'success';
        if (status === 'processing') color = 'processing';
        if (status === 'pending') color = 'warning';
        if (status === 'cancelled') color = 'error';
        return <Badge status={color as any} text={status.toUpperCase()} />;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => showOrderDetails(record.id)}>Details</Button>
      ),
    },
  ];

  const chartData = useMemo(() => data?.charts?.salesTrends?.map((item: any) => ({
    name: item.label,
    revenue: Number(item.value)
  })) || [], [data]);

  const pieData = useMemo(() => data?.charts?.categoryDistribution?.map((item: any) => ({
    name: item.name,
    value: Number(item.productCount)
  })) || [], [data]);

  const tabItems = [
    {
      key: '1',
      label: 'Performance',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title={<Space><HistoryOutlined /> Sales Trends</Space>} bordered={false} style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677ff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1677ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title={<Space><FireOutlined /> Top Selling</Space>} bordered={false} style={{ height: '400px' }}>
              <List
                itemLayout="horizontal"
                dataSource={data?.inventory?.topSelling || []}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.images?.[0]?.url} shape="square" />}
                      title={item.name}
                      description={`${item.soldCount} units sold`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: 'Inventory Alerts',
      children: (
        <Card title={<Space><WarningOutlined /> Low Stock Warning</Space>} bordered={false}>
          <Table 
            dataSource={data?.inventory?.lowStock || []} 
            pagination={false}
            rowKey="id"
            columns={[
              { title: 'Product', dataIndex: 'name', key: 'name' },
              { title: 'SKU', dataIndex: 'sku', key: 'sku' },
              { 
                title: 'Remaining', 
                dataIndex: 'stockQuantity', 
                key: 'stockQuantity',
                render: (q) => <Progress percent={q * 10} status="exception" size="small" format={() => `${q} left`} />
              }
            ]}
          />
        </Card>
      ),
    },
    {
      key: '3',
      label: 'Market Share',
      children: (
        <Card title="Categories Distribution" bordered={false} style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Executive Command Center</Title>
          <Text type="secondary">Analytics for period: 
            <Select 
              value={period} 
              onChange={setPeriod} 
              size="small" 
              bordered={false} 
              style={{ color: '#1677ff', fontWeight: 'bold' }}
            >
              <Option value="daily">Today</Option>
              <Option value="weekly">Last 7 Days</Option>
              <Option value="monthly">This Month</Option>
              <Option value="yearly">This Year</Option>
            </Select>
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDashboardData} loading={loading}>Refresh</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => message.info('PDF Report generation starting...')}>Report</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportCSV}>Export CSV</Button>
        </Space>
      </div>

      {error && (
        <Alert
          message="Data Loading Error"
          description={error}
          type="error"
          showIcon
          action={<Button size="small" onClick={fetchDashboardData}>Retry</Button>}
          style={{ marginBottom: 24 }}
        />
      )}

      {loading && !data ? (
        <Skeleton active paragraph={{ rows: 15 }} />
      ) : (
        <>
          {/* KPI CARDS */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            {topLevelStats.map((stat, index) => (
              <Col xs={24} sm={12} xl={6} key={index}>
                <Card bordered={false} hoverable style={{ borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Statistic
                      title={<Text type="secondary" strong>{stat.title.toUpperCase()}</Text>}
                      value={stat.value}
                      prefix={stat.prefix}
                      valueStyle={{ color: '#0f172a', fontWeight: 800, fontSize: '28px' }}
                    />
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: `${stat.color}15`, 
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {stat.icon}
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>{stat.subValue}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Tabs defaultActiveKey="1" items={tabItems} size="large" style={{ marginBottom: 24 }} />

          <Card title="Recent Transactions" bordered={false} styles={{ body: { padding: 0 } }} style={{ borderRadius: '12px' }}>
            <Table 
              dataSource={data?.recentOrders} 
              columns={orderColumns} 
              rowKey="id" 
              pagination={false}
              loading={loading}
            />
          </Card>
        </>
      )}

      {/* ORDER DETAILS MODAL */}
      <Modal
        title={`Order Details: ${selectedOrder?.orderNumber}`}
        open={isOrderModalVisible}
        onCancel={() => setIsOrderModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsOrderModalVisible(false)}>Close</Button>,
          <Button key="print" type="primary" onClick={() => window.print()}>Print Invoice</Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Order Number">{selectedOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="Date">{new Date(selectedOrder.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Customer">{selectedOrder.user?.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedOrder.status === 'delivered' ? 'green' : 'blue'}>{selectedOrder.status.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address" span={2}>{selectedOrder.shippingAddress}</Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                <Text strong style={{ fontSize: 18 }}>${Number(selectedOrder.total).toFixed(2)}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Order Items</Title>
            <Table
              dataSource={selectedOrder.items}
              pagination={false}
              rowKey="id"
              size="small"
              columns={[
                { title: 'Product', dataIndex: 'productName', key: 'productName' },
                { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                { title: 'Price', dataIndex: 'price', key: 'price', render: (p) => `$${Number(p).toFixed(2)}` },
                { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Total', dataIndex: 'total', key: 'total', render: (t) => `$${Number(t).toFixed(2)}` },
              ]}
            />
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
