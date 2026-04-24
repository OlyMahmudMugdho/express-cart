import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '../../utils/api';
import Skeleton from '../../components/Skeleton';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await api.getProduct(id as string);
      setProduct(data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await api.addToCart(id as string, 1);
      setSnackbarMessage('Added to cart!');
      setSnackbarVisible(true);
    } catch (err: any) {
      setSnackbarMessage(err.message || 'Failed to add to cart');
      setSnackbarVisible(true);
    } finally {
      setAdding(false);
    }
  };

  const DetailSkeleton = () => (
    <View style={{ flex: 1 }}>
      <Skeleton width="100%" height={350} borderRadius={0} />
      <View style={styles.content}>
        <Skeleton width="40%" height={16} />
        <Skeleton width="80%" height={28} style={{ marginTop: 12 }} />
        <Skeleton width="30%" height={24} style={{ marginTop: 12 }} />
        <View style={styles.divider} />
        <Skeleton width="100%" height={16} style={{ marginTop: 8 }} />
        <Skeleton width="100%" height={16} style={{ marginTop: 8 }} />
        <Skeleton width="60%" height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {isFocused && <StatusBar style="dark" />}
        <DetailSkeleton />
      </View>
    );
  }

  if (!product) return <Text>Product not found</Text>;

  return (
    <View style={styles.container}>
      {isFocused && <StatusBar style="dark" />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.images?.[0]?.url || 'https://via.placeholder.com/400' }} 
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + 12 }]} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{product.category?.name}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button 
          mode="contained" 
          onPress={handleAddToCart} 
          loading={adding}
          style={styles.addToCartButton}
          buttonColor="#0f172a"
          textColor="#fff"
        >
          Add to Cart
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        <View style={styles.snackbarContent}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.snackbarText}>{snackbarMessage}</Text>
        </View>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    padding: 24,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  addToCartButton: {
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
  },
  snackbar: {
    backgroundColor: '#0f172a',
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
