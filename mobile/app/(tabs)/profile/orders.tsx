import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface OrderItem {
  id: string;
  product: {
    name: string;
    images: { url: string }[];
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total: number | string;
  items: OrderItem[];
  createdAt: string;
}

export default function Orders() {
  const api = useApi();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    console.log('=== fetchOrders START ===');
    console.log('token:', token);
    if (!token) {
      console.log('No token, setting empty orders');
      setLoading(false);
      setOrders([]);
      return;
    }
    try {
      console.log('Calling api.getOrders...');
      const res = await api.getOrders();
      console.log('Got response, type:', typeof res, 'isArray:', Array.isArray(res));
      console.log('Response:', JSON.stringify(res));
      
      // Handle various response formats
      let ordersArray = [];
      if (Array.isArray(res)) {
        ordersArray = res;
      } else if (res && Array.isArray(res.data)) {
        ordersArray = res.data;
      } else if (res && Array.isArray(res.orders)) {
        ordersArray = res.orders;
      } else {
        ordersArray = [];
      }
      
      console.log('Orders array to set:', ordersArray.length);
      setOrders(ordersArray);
    } catch (err) {
      console.warn('Orders error:', err);
      setOrders([]);
    } finally {
      console.log('=== fetchOrders END ===');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    console.log('Orders useEffect, token:', !!token);
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return '#22c55e';
      case 'processing':
        return '#f59e0b';
      case 'shipped':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Please sign in</Text>
        <Text style={styles.emptySubtitle}>Sign in to view your orders</Text>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>📦</Text>
        </View>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Your orders will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
                <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={styles.orderItems}>
              {item.items?.slice(0, 2).map((orderItem: OrderItem) => (
                <View key={orderItem.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName} numberOfLines={1}>
                    {orderItem.product?.name}
                  </Text>
                  <Text style={styles.orderItemQty}>x{orderItem.quantity}</Text>
                </View>
              ))}
              {item.items?.length > 2 && (
                <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
              )}
            </View>
            <View style={styles.orderFooter}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${Number(item.total).toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  orderDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  orderItemQty: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  moreItems: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
});