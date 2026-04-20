import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import ProductCard from '../../components/ProductCard';
import { useApi } from '../../utils/api';

export default function Products() {
  const api = useApi();
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (pageNum: number) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await api.getProducts();
      // Mocked pagination logic based on current API structure
      const newProducts = res.products ?? [];
      setProducts((prev) => (pageNum === 1 ? newProducts : [...prev, ...newProducts]));
      setHasMore(newProducts.length > 0);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    fetchProducts(1);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(p, index) => `${p.id}-${index}`}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.column}>
            <ProductCard item={item} />
          </View>
        )}
        onEndReached={() => {
          if (hasMore) {
            setPage((p) => p + 1);
            fetchProducts(page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  column: { flex: 1 / 2 },
  loader: { marginVertical: 20 },
});
