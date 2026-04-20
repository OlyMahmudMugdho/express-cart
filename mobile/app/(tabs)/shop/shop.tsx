import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Searchbar } from 'react-native-paper';
import ProductCard from '../../components/ProductCard';
import { useApi } from '../../utils/api';

export default function Products() {
  const api = useApi();
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchProducts = useCallback(async (pageNum: number, search: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.getProducts({ page: pageNum, limit: 10, search });
      const newProducts = res.products ?? [];
      setProducts((prev) => (pageNum === 1 ? newProducts : [...prev, ...newProducts]));
      setHasMore(newProducts.length > 0 && pageNum < res.totalPages);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, debouncedSearch);
  }, [debouncedSearch]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, debouncedSearch);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search products..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={products}
        keyExtractor={(p, index) => `${p.id}-${index}`}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.column}>
            <ProductCard item={item} />
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No products found</Text> : null}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchBar: { margin: 16, elevation: 2, backgroundColor: '#fff' },
  column: { flex: 1 / 2 },
  loader: { marginVertical: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b' },
});
