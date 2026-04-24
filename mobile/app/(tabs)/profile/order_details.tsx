import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '../../utils/api';
import { useIsFocused } from '@react-navigation/native';
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

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const data = await api.getOrder(id as string);
      setOrder(data);
    } catch (err) {
      console.warn('Failed to fetch order details:', err);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return '#22c55e';
      case 'processing':
        return '#1677ff';
      case 'shipped':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const DetailSkeleton = () => (
    <View style={styles.content}>
      <View style={styles.statusSection}>
        <Skeleton width={100} height={32} borderRadius={16} />
        <Skeleton width={180} height={24} style={{ marginTop: 12 }} />
        <Skeleton width={150} height={16} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.card}>
        <Skeleton width={80} height={20} style={{ marginBottom: 16 }} />
        {[1, 2, 3].map(i => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
               <Skeleton width="80%" height={16} />
               <Skeleton width="30%" height={12} style={{ marginTop: 4 }} />
            </View>
            <Skeleton width={60} height={16} />
          </View>
        ))}
      </View>
    </View>
  );

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

      {loading ? (
        <DetailSkeleton />
      ) : order ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.orderIdText}>{order.orderNumber}</Text>
            <Text style={styles.orderDateText}>
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Items</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</Text>
                </View>
                <Text style={styles.itemPrice}>${Number(item.total).toFixed(2)}</Text>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${Number(order.subtotal).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>${Number(order.shippingCost).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%)</Text>
              <Text style={styles.summaryValue}>${Number(order.tax).toFixed(2)}</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${Number(order.total).toFixed(2)}</Text>
            </View>
          </View>

          {order.shippingAddress && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shipping Address</Text>
              <Text style={styles.addressText}>{order.shippingAddress}</Text>
            </View>
          )}

          {order.notes && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Notes</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Order not found</Text>
          <Button mode="text" onPress={() => router.replace('/profile/orders')} textColor="#0f172a">Go Back</Button>
        </View>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  content: { flex: 1, padding: 16 },
  statusSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  statusText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  orderIdText: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  orderDateText: { fontSize: 14, color: '#64748b' },
  card: {
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  itemQty: { fontSize: 13, color: '#64748b' },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginLeft: 16 },
  divider: { marginVertical: 12, backgroundColor: '#f1f5f9' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  addressText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  notesText: { fontSize: 14, color: '#475569', lineHeight: 20, fontStyle: 'italic' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 16, color: '#64748b', fontWeight: '600' }
});
