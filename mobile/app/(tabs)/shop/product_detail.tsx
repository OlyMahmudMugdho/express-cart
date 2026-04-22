import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  const { token } = useAuth();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('#0f172a');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getProduct(id as string);
        setProduct(res);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      let res;
      if (token) {
        res = await api.addToCart(id as string, 1);
      } else {
        res = await api.addToCartGuest(id as string, 1);
      }
      setAdding(false);
      
      // Success Haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setSnackbarMessage('Added to your cart');
      setSnackbarColor('#0f172a');
      setSnackbarVisible(true);
    } catch (err: any) {
      setAdding(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSnackbarMessage(err.message || 'Failed to add to cart');
      setSnackbarColor('#ef4444');
      setSnackbarVisible(true);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!product) return <Text style={{ margin: 16 }}>Product not found.</Text>;

  const image = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>${product.price}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Button 
            mode="contained" 
            style={styles.button} 
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={handleAddToCart} 
            loading={adding} 
            icon="cart-outline"
            buttonColor="#0f172a"
            textColor="#fff"
          >
            Add to Cart
          </Button>
        </View>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        action={{
          label: 'View Cart',
          textColor: '#60a5fa',
          onPress: () => router.push('/(tabs)/cart/'),
        }}
        style={[styles.snackbar, { backgroundColor: snackbarColor }]}
      >
        <View style={styles.snackbarContent}>
          <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
          <Text style={styles.snackbarText}>{snackbarMessage}</Text>
        </View>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 350 },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  price: { fontSize: 24, fontWeight: '700', color: '#1677ff', marginBottom: 16 },
  description: { fontSize: 16, color: '#475569', lineHeight: 24, marginBottom: 32 },
  button: { 
    borderRadius: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    height: 54,
    flexDirection: 'row-reverse',
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  snackbar: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 6,
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  snackbarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
