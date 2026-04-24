import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/Skeleton';

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
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setOrders([]);
      return;
    }
    try {
      const res = await api.getOrders();
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
      setOrders(ordersArray);
    } catch (err) {
      console.warn('Orders error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
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

  const OrderSkeleton = () => (
    <View style={styles.listContent}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.orderCard}>
          <View style={[styles.orderHeader, { marginBottom: 12 }]}>
            <View style={{ gap: 4 }}>
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={12} />
            </View>
            <Skeleton width={70} height={24} borderRadius={8} />
          </View>
          <View style={styles.orderItems}>
            <Skeleton width="90%" height={14} style={{ marginTop: 12 }} />
            <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.orderFooter}>
            <Skeleton width={40} height={14} />
            <Skeleton width={60} height={20} />
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {isFocused && <StatusBar style="dark" />}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 24 }} />
        </View>
        <OrderSkeleton />
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

  return (
    <View style={styles.container}>
      {isFocused && <StatusBar style="dark" />}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📦</Text>
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>Your orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.orderCard}
              onPress={() => router.push({
                pathname: '/profile/order_details',
                params: { id: item.id }
              })}
            >
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
                <View>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${Number(item.total).toFixed(2)}</Text>
                </View>
                <View style={styles.detailsButton}>
                  <Text style={styles.detailsButtonText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#0f172a" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
