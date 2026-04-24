import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config';
import Skeleton from '../../components/Skeleton';
import { Image } from 'expo-image';

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
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

  const resolveImageUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('http')) return url;
    // Prepend base URL for relative paths
    const baseUrl = CONFIG.API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

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
      }
      setOrders(ordersArray);
    } catch (err) {
      console.warn('Orders error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token, api]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return { color: '#22c55e', icon: 'checkmark-circle' };
      case 'processing':
        return { color: '#1677ff', icon: 'sync' };
      case 'shipped':
        return { color: '#3b82f6', icon: 'airplane' };
      case 'cancelled':
        return { color: '#ef4444', icon: 'close-circle' };
      default:
        return { color: '#64748b', icon: 'time' };
    }
  };

  const OrderSkeleton = () => (
    <View style={styles.listContent}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={{ gap: 6 }}>
              <Skeleton width={100} height={18} />
              <Skeleton width={140} height={14} />
            </View>
            <Skeleton width={80} height={28} borderRadius={20} />
          </View>
          <View style={styles.skeletonItems}>
            <Skeleton width={50} height={50} borderRadius={10} />
            <View style={{ flex: 1, gap: 8 }}>
               <Skeleton width="90%" height={12} />
               <Skeleton width="40%" height={12} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {isFocused && <StatusBar style="dark" />}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.replace('/profile/account')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <OrderSkeleton />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
             <Ionicons name="receipt-outline" size={40} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>When you place an order, it will appear here.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/shop/shop')}>
             <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f172a" colors={["#0f172a"]} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            const orderItems = item.items || [];
            return (
              <TouchableOpacity 
                style={styles.orderCard}
                activeOpacity={0.9}
                onPress={() => router.push({
                  pathname: '/profile/order_details',
                  params: { id: item.id }
                })}
              >
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>{item.orderNumber?.split('-').slice(0,2).join('-') || `Order #${item.id.slice(0, 8)}`}</Text>
                    <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                    <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderPreview}>
                  <View style={styles.imagesContainer}>
                    {orderItems.slice(0, 3).map((orderItem, idx) => {
                      const imageUri = resolveImageUrl(orderItem.productImage);
                      return (
                        <View 
                          key={orderItem.id || `img-${item.id}-${idx}`} 
                          style={[styles.itemThumbnailContainer, { marginLeft: idx === 0 ? 0 : -15, zIndex: 10 - idx }]}
                        >
                          {imageUri ? (
                            <Image 
                              source={imageUri} 
                              style={styles.itemThumbnail}
                              contentFit="cover"
                              transition={200}
                            />
                          ) : (
                            <View style={styles.thumbnailPlaceholder}>
                              <Ionicons name="image-outline" size={18} color="#cbd5e1" />
                            </View>
                          )}
                        </View>
                      );
                    })}
                    {orderItems.length > 3 && (
                      <View style={styles.moreCount}>
                        <Text style={styles.moreCountText}>+{orderItems.length - 3}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.itemCount}>{orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}</Text>
                    <Text style={styles.totalValue}>${Number(item.total).toFixed(2)}</Text>
                  </View>
                </View>
                
                <View style={styles.cardFooter}>
                  <Button 
                    mode="contained" 
                    compact 
                    buttonColor="#eff6ff" 
                    textColor="#1677ff"
                    labelStyle={styles.viewDetailsText}
                    style={styles.viewDetailsButton}
                    icon={({ size, color }) => <Ionicons name="chevron-forward" size={16} color={color} />}
                    contentStyle={{ flexDirection: 'row-reverse' }}
                    onPress={() => router.push({
                      pathname: '/profile/order_details',
                      params: { id: item.id }
                    })}
                  >
                    View Details
                  </Button>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  listContent: { padding: 20, paddingBottom: 40 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  orderDate: { fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: '500' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  imagesContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemThumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemThumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCount: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  moreCountText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  orderInfo: { alignItems: 'flex-end', marginLeft: 12 },
  itemCount: { fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  cardFooter: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  viewDetailsButton: {
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  viewDetailsText: { fontSize: 13, fontWeight: '700' },
  skeletonItems: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  emptySubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  shopButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
