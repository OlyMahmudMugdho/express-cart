import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderNumber = params.orderNumber as string || 'N/A';
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
        </Animated.View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>Thank you for your order</Text>
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Order Number</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>
        </View>

        <Text style={styles.message}>
          Your order has been placed successfully. We'll send you a confirmation email with order details.
        </Text>

        <View style={styles.paymentInfo}>
          <Ionicons name="cash-outline" size={20} color="#92400e" />
          <Text style={styles.paymentText}>Cash on Delivery</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => router.replace('/cart')}
          style={styles.primaryButton}
          buttonColor="#0f172a"
          textColor="#fff"
        >
          Continue Shopping
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.replace('/(tabs)/profile/orders')}
          style={styles.secondaryButton}
          textColor="#0f172a"
        >
          View Orders
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
  },
  orderInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  message: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  primaryButton: {
    borderRadius: 10,
  },
  secondaryButton: {
    borderRadius: 10,
    borderColor: '#0f172a',
  },
});