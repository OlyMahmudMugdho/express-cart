import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '../../utils/api';
import { useIsFocused } from '@react-navigation/native';
import { CONFIG } from '../../config';
import Skeleton from '../../components/Skeleton';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  productImage?: string;
  sku?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
  notes?: string;
  shippingAddress?: string;
}

const OrderSkeletonWrapper = () => (
  <View style={{ flex: 1, padding: 20 }}>
    <View style={styles.statusCard}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton width={150} height={20} style={{ marginTop: 16 }} />
      <Skeleton width={200} height={14} style={{ marginTop: 8 }} />
    </View>
    <View style={styles.card}>
      <Skeleton width={100} height={18} style={{ marginBottom: 20 }} />
      {[1, 2].map(i => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <Skeleton width={60} height={60} borderRadius={12} />
          <View style={{ flex: 1, gap: 8 }}>
             <Skeleton width="80%" height={16} />
             <Skeleton width="30%" height={12} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = CONFIG.API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchOrderDetails = useCallback(async () => {
    try {
      const data = await api.getOrder(id as string);
      setOrder(data);
    } catch (err) {
      console.warn('Failed to fetch order details:', err);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [id, api]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

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

  const statusInfo = order ? getStatusInfo(order.status) : { color: '#64748b', icon: 'time' };

  if (loading) {
    return (
      <View style={styles.container}>
        {isFocused && <StatusBar style="dark" />}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.replace('/profile/orders')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <OrderSkeletonWrapper />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
             <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          </View>
          <Text style={styles.errorText}>Order Not Found</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => router.replace('/profile/orders')}>
             <Text style={styles.goBackButtonText}>Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && <StatusBar style="dark" />}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.replace('/profile/orders')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={[styles.statusIconContainer, { backgroundColor: statusInfo.color + '15' }]}>
             <Ionicons name={statusInfo.icon as any} size={40} color={statusInfo.color} />
          </View>
          <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
             {order.status.toUpperCase()}
          </Text>
          <Text style={styles.orderIdText}>{order.orderNumber}</Text>
          <Text style={styles.orderDateText}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          <View style={styles.itemsList}>
            {order.items.map((item) => {
              const imageUri = resolveImageUrl(item.productImage);
              return (
                <View key={item.id} style={styles.orderItem}>
                  <View style={styles.imageContainer}>
                    {imageUri ? (
                      <Image 
                        source={{ uri: imageUri }} 
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={24} color="#94a3b8" />
                      </View>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.itemPrice}>${Number(item.total).toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
          
          <View style={styles.pricingSection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${Number(order.subtotal).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>${Number(order.shippingCost).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Tax</Text>
              <Text style={styles.summaryValue}>${Number(order.tax).toFixed(2)}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${Number(order.total).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <Ionicons name="location-outline" size={20} color="#0f172a" style={{ marginRight: 8 }} />
             <Text style={styles.cardTitle}>Shipping Address</Text>
          </View>
          <Text style={styles.addressText}>{order.shippingAddress || 'No address provided'}</Text>
        </View>

        {order.notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <Ionicons name="document-text-outline" size={20} color="#0f172a" style={{ marginRight: 8 }} />
               <Text style={styles.cardTitle}>Order Notes</Text>
            </View>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.supportButton} onPress={() => Alert.alert('Support', 'Contacting support...')}>
           <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0f172a" style={{ marginRight: 8 }} />
           <Text style={styles.supportButtonText}>Need Help with this Order?</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: { flex: 1, padding: 20 },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  orderIdText: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  orderDateText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  card: {
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  itemsList: { gap: 20, marginBottom: 20 },
  orderItem: { flexDirection: 'row', alignItems: 'center' },
  imageContainer: { width: 60, height: 60, borderRadius: 14, backgroundColor: '#f8fafc', overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  itemInfo: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0f172a', lineHeight: 18, marginBottom: 4 },
  itemQty: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  pricingSection: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  divider: { marginVertical: 12, backgroundColor: '#e2e8f0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#1677ff' },
  addressText: { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '500' },
  notesText: { fontSize: 14, color: '#475569', lineHeight: 22, fontStyle: 'italic' },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 40,
  },
  supportButtonText: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  errorText: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  errorSubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  goBackButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  goBackButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
