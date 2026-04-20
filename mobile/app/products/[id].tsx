import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApi } from '../utils/api';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  const [product, setProduct] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await api.getProduct(id as string);
        setProduct(res);
      } catch (err) {
        console.warn(err);
      }
    })();
  }, [id]);

  if (!product) return <Text style={{ margin: 16 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge">{product.name}</Text>
      <Text style={{ marginTop: 8 }}>{product.description}</Text>
      <Button style={{ marginTop: 16 }} mode="contained" onPress={async () => {
        try {
          await api.addToCart(product.id, 1);
          router.push('/cart');
        } catch (err) { console.warn(err); }
      }}>
        Add to cart
      </Button>
    </ScrollView>
  );
}
