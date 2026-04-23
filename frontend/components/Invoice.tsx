'use client';

import React from 'react';
import { Typography, Table, Row, Col, Divider } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface InvoiceProps {
  order: any;
}

export default function Invoice({ order }: InvoiceProps) {
  if (!order) return null;

  const columns = [
    { 
      title: 'Item', 
      key: 'image', 
      width: 80,
      render: (_: any, record: any) => (
        <img 
          src={record.productImage || 'https://via.placeholder.com/50'} 
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} 
        />
      )
    },
    { title: 'Item Description', dataIndex: 'productName', key: 'productName' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Price', dataIndex: 'price', key: 'price', align: 'right' as const, render: (p: any) => `$${Number(p).toFixed(2)}` },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center' as const },
    { title: 'Total', dataIndex: 'total', key: 'total', align: 'right' as const, render: (t: any) => `$${Number(t).toFixed(2)}` },
  ];

  return (
    <div className="invoice-container" style={{ padding: '40px', background: '#fff', color: '#000' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '40px' }}>
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#1677ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCartOutlined style={{ color: '#fff', fontSize: '24px' }} />
            </div>
            <Title level={3} style={{ margin: 0 }}>ExpressCart</Title>
          </div>
          <Text type="secondary">123 Commerce St, Tech City, 54321</Text>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <Title level={2} style={{ margin: 0, color: '#1677ff' }}>INVOICE</Title>
          <Text strong>#{order.orderNumber}</Text>
        </Col>
      </Row>

      {/* Bill To */}
      <Row gutter={40} style={{ marginBottom: '40px' }}>
        <Col span={12}>
          <Text type="secondary" strong style={{ display: 'block', marginBottom: '8px' }}>BILLED TO:</Text>
          <Text strong style={{ fontSize: '16px' }}>{order.user?.email || 'Valued Customer'}</Text><br />
          <Text>{order.shippingAddress || 'N/A'}</Text>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '12px' }}>
            <Text type="secondary" strong>ORDER DATE:</Text><br />
            <Text>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </div>
          <div>
            <Text type="secondary" strong>PAYMENT STATUS:</Text><br />
            <Text strong style={{ color: order.status === 'delivered' ? '#52c41a' : '#1677ff' }}>{order.status.toUpperCase()}</Text>
          </div>
        </Col>
      </Row>

      {/* Items Table */}
      <Table
        dataSource={order.items}
        columns={columns}
        pagination={false}
        rowKey="id"
        bordered
        scroll={{ x: 500 }}
        style={{ marginBottom: '30px' }}
      />

      {/* Summary */}
      <Row justify="end">
        <Col span={8}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text>Subtotal:</Text>
            <Text>${Number(order.subtotal || 0).toFixed(2)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text>Shipping:</Text>
            <Text>${Number(order.shippingCost || 0).toFixed(2)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text>Tax (8%):</Text>
            <Text>${Number(order.tax || 0).toFixed(2)}</Text>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>Total Amount:</Title>
            <Title level={4} style={{ margin: 0, color: '#1677ff' }}>${Number(order.total).toFixed(2)}</Title>
          </div>
        </Col>
      </Row>

      {/* Footer */}
      <div style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
        <Text type="secondary">Thank you for shopping with ExpressCart!</Text><br />
        <Text type="secondary" style={{ fontSize: '12px' }}>If you have any questions, please contact support@expresscart.com</Text>
      </div>
    </div>
  );
}
