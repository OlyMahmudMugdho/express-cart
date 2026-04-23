import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';

function CartHeader() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  return (
    <View style={[headerStyles.container, { paddingTop: insets.top + 10 }]}>
      {isFocused && <StatusBar style="light" />}
      <View style={headerStyles.content}>
        <View style={headerStyles.badge}>
          <Text style={headerStyles.badgeText}>Shopping</Text>
        </View>
        <Text style={headerStyles.title}>Your Cart</Text>
        <Text style={headerStyles.subtitle}>Review your items before checkout</Text>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
  },
});

export default function Cart() {
  const api = useApi();
  const auth = useAuth();
  const { token, user, isLoading: authLoading } = auth;
  const [authReady, setAuthReady] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCart = useCallback(async () => {
    const currentToken = auth.token;
    console.log('fetchCart called, token:', !!currentToken);
    if (!currentToken) {
      console.log('No token, setting empty');
      setLoading(false);
      setItems([]);
      return;
    }
    try {
      console.log('Fetching cart...');
      const res = await api.getCart();
      console.log('getCart response:', JSON.stringify(res).substring(0, 500));
      if (res && Array.isArray(res)) {
        console.log('Setting items from array, count:', res.length);
        setItems(res);
        setError(null);
      } else if (res && res.items) {
        console.log('Setting items from object, count:', res.items.length);
        setItems(res.items);
        setError(null);
      } else {
        console.log('No items found in response');
        setItems([]);
      }
    } catch (err) {
      console.warn('Cart error:', err);
      setError('Failed to load cart');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  // Refresh cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!authLoading && token) {
        fetchCart();
      }
    }, [token, authLoading, fetchCart])
  );

  // Fetch on mount and when token changes
  useEffect(() => {
    console.log('Cart effect - authLoading:', authLoading, 'token:', !!token);
    
    const loadCart = async () => {
      if (!authLoading && token) {
        console.log('Auth ready, fetching cart');
        await fetchCart();
      } else if (!authLoading && !token) {
        console.log('No token, showing empty');
        setItems([]);
        setLoading(false);
      } else {
        console.log('Auth still loading...');
      }
    };
    
    loadCart();
  }, [token, authLoading, fetchCart]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    console.log('Button pressed - itemId:', itemId, 'quantity:', quantity);
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    try {
      const res = await api.updateCartItem(itemId, quantity);
      console.log('Update quantity response:', res);
      fetchCart();
    } catch (err) {
      console.warn('Update quantity error:', err);
    }
  };

  const removeItem = async (itemId: string) => {
    console.log('Removing item:', itemId);
    try {
      const res = await api.removeCartItem(itemId);
      console.log('Remove item response:', res);
      fetchCart();
    } catch (err) {
      console.warn('Remove item error:', err);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || item.price || 0);
    return sum + price * item.quantity;
  }, 0);

  if (loading || authLoading) {
    return (
      <View style={styles.emptyContainer}>
        {isFocused && <StatusBar style="dark" />}
        <Text style={styles.emptyText}>Loading...</Text>
        <Text style={styles.debugText}>Auth loading: {String(authLoading)}, Token: {token ? 'present' : 'missing'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        {isFocused && <StatusBar style="dark" />}
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.debugText}>Token: {token ? 'present' : 'missing'}</Text>
        <Button onPress={fetchCart}>Retry</Button>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.emptyContainer}>
        {isFocused && <StatusBar style="dark" />}
        <Text style={styles.emptyTitle}>Sign in to view cart</Text>
        <Text style={styles.emptySubtitle}>Your cart items will appear here after sign in</Text>
        <Link href="/profile/login" asChild>
          <Button mode="contained" style={styles.primaryButton} textColor="#fff">Sign In</Button>
        </Link>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.emptyContainer}>
        {isFocused && <StatusBar style="dark" />}
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>🛒</Text>
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some items to get started</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <CartHeader />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const product = item.product;
          console.log('Cart item product:', JSON.stringify(product));
          let image = product?.images?.[0]?.url || product?.image;
          // If no image, use a placeholder background color
          return (
            <View style={styles.cartItem}>
              {image ? (
                <Image source={{ uri: image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, { backgroundColor: '#f1f5f9' }]} />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{product?.name || item.productName || 'Product'}</Text>
                <Text style={styles.itemPrice}>${product?.price}</Text>
                <View style={styles.quantityRow}>
                  <TouchableOpacity 
                    style={styles.qtyButton} 
                    onPressIn={() => { console.log('Minus pressed'); updateQuantity(item.id, item.quantity - 1); }}
                  >
                    <Ionicons name="remove" size={18} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.qtyButton} 
                    onPressIn={() => { console.log('Plus pressed'); updateQuantity(item.id, item.quantity + 1); }}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPressIn={() => { console.log('Delete pressed'); removeItem(item.id); }}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <Link href="/cart/checkout" asChild>
          <Button mode="contained" style={styles.checkoutButton} textColor="#fff">
            Proceed to Checkout
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
    color: '#0f172a',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  checkoutButton: {
    marginTop: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#0f172a',
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
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
});