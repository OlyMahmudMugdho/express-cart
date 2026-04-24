import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Text, Searchbar, Chip, Menu, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../../components/ProductCard';
import Skeleton from '../../components/Skeleton';
import { useApi } from '../../utils/api';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Alphabetical', value: 'name' },
];

export default function Products() {
  const api = useApi();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');
  const [menuVisible, setMenuVisible] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res);
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async (pageNum: number, search: string, catId: string | null, sortVal: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.getProducts({ 
        page: pageNum, 
        limit: 10, 
        search, 
        categoryId: catId || undefined,
        sort: sortVal 
      });
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
    fetchProducts(1, debouncedSearch, selectedCategoryId, sort);
  }, [debouncedSearch, selectedCategoryId, sort]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, debouncedSearch, selectedCategoryId, sort);
    }
  };

  const ProductSkeleton = () => (
    <View style={styles.column}>
      <View style={styles.skeletonCard}>
        <Skeleton height={150} borderRadius={12} />
        <Skeleton height={16} width="80%" style={{ marginTop: 12 }} />
        <Skeleton height={16} width="40%" style={{ marginTop: 8 }} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isFocused && <StatusBar style="dark" />}
      
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="Search products..."
            placeholderTextColor="#94a3b8"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#0f172a"
            rippleColor="#e2e8f0"
            mode="bar"
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                onPress={() => setMenuVisible(true)}
                style={styles.filterButton}
              >
                <Ionicons name="options-outline" size={22} color="#0f172a" />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Sort By</Text>
            </View>
            <Divider style={styles.menuDivider} />
            {SORT_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setSort(option.value);
                  setMenuVisible(false);
                }}
                title={option.label}
                titleStyle={{ 
                  color: sort === option.value ? '#0f172a' : '#64748b', 
                  fontWeight: sort === option.value ? '700' : '400',
                  fontSize: 14
                }}
                leadingIcon={sort === option.value ? "check" : undefined}
              />
            ))}
          </Menu>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryList}
        >
          <Chip
            selected={selectedCategoryId === null}
            onPress={() => setSelectedCategoryId(null)}
            style={[styles.chip, selectedCategoryId === null && styles.selectedChip]}
            textStyle={[styles.chipText, selectedCategoryId === null && styles.selectedChipText]}
            showSelectedOverlay={false}
            mode="flat"
          >
            All Items
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              selected={selectedCategoryId === cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
              style={[styles.chip, selectedCategoryId === cat.id && styles.selectedChip]}
              textStyle={[styles.chipText, selectedCategoryId === cat.id && styles.selectedChipText]}
              showSelectedOverlay={false}
              mode="flat"
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={loading && page === 1 ? [1, 2, 3, 4, 5, 6] : products}
        keyExtractor={(item, index) => (typeof item === 'number' ? `skeleton-${index}` : `${item.id}-${index}`)}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (typeof item === 'number') return <ProductSkeleton />;
          return (
            <View style={styles.column}>
              <ProductCard item={item} />
            </View>
          );
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No products found</Text> : null}
        ListFooterComponent={loading && page > 1 ? <ActivityIndicator style={styles.loader} color="#0f172a" /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  searchBar: { 
    flex: 1,
    elevation: 0, 
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    color: '#0f172a',
    fontSize: 14,
    minHeight: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 0,
    height: 36,
  },
  selectedChip: {
    backgroundColor: '#0f172a',
  },
  chipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: '700',
  },
  menuContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 48,
    width: 200,
  },
  menuHeader: {
    padding: 12,
    paddingBottom: 8,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuDivider: {
    backgroundColor: '#f1f5f9',
  },
  list: {
    padding: 8,
    paddingTop: 12,
  },
  column: { flex: 1 / 2 },
  loader: { marginVertical: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b' },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    margin: 8,
  },
});
