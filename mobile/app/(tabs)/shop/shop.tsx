import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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

  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchProducts(1, debouncedSearch, selectedCategoryId, sort);
    setRefreshing(false);
  }, [debouncedSearch, selectedCategoryId, sort, fetchProducts]);

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
  }, [loading, api]);

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
        data={loading && page === 1 && !refreshing ? [1, 2, 3, 4, 5, 6] : products}
        keyExtractor={(item, index) => (typeof item === 'number' ? `skeleton-${index}` : `${item.id}-${index}`)}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f172a" colors={["#0f172a"]} />
        }
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
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  searchBar: { 
    flex: 1,
    elevation: 0, 
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    height: 48,
  },
  searchInput: {
    color: '#0f172a',
    fontSize: 15,
    minHeight: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 0,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#0f172a',
  },
  chipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginVertical: 0,
    marginHorizontal: 8, // Added horizontal margin for better spacing
    paddingVertical: 0,
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: '700',
  },
  menuContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 52,
    width: 220,
    paddingVertical: 8,
    elevation: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  menuHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  menuDivider: {
    backgroundColor: '#f1f5f9',
    marginHorizontal: 8,
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  column: { 
    width: '48%', // Explicit width to allow gap
  },
  loader: { marginVertical: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b', fontSize: 16, fontWeight: '500' },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
});
