import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import ProductCard from '../components/ProductCard';
import { useApi } from '../utils/api';

export default function Products() {
  const api = useApi();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getProducts();
        setProducts(Array.isArray(res) ? res : res.products ?? []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!products.length) return <Text style={{ margin: 16 }}>No products found.</Text>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <ProductCard item={item} />}
      />
    </View>
  );
}
