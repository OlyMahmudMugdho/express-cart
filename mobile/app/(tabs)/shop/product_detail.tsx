import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  const { token } = useAuth();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

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
      if (token) {
        await api.addToCart(id as string, 1);
      } else {
        await api.addToCartGuest(id as string, 1);
      }
      Alert.alert('Success', 'Item added to cart!', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') }
      ]);
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Failed to add item to cart. Please sign in first.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!product) return <Text style={{ margin: 16 }}>Product not found.</Text>;

  const image = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Button mode="contained" style={styles.button} onPress={handleAddToCart} loading={adding} textColor="#fff">
          Add to Cart
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 350 },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '700', color: '#64748b', marginBottom: 16 },
  description: { fontSize: 16, color: '#475569', lineHeight: 24, marginBottom: 24 },
  button: { paddingVertical: 8, borderRadius: 12 },
});
