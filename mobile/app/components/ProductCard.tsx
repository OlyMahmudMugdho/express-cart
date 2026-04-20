import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Link } from 'expo-router';

export default function ProductCard({ item }: { item: any }) {
  const image = item.images?.find((img: any) => img.isPrimary)?.url || item.images?.[0]?.url;

  return (
    <Link href={{ pathname: '/(tabs)/shop/product_detail', params: { id: item.id } }} asChild>
      <Pressable style={styles.card}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.category}>{item.category?.name}</Text>
          <Text style={styles.price}>${item.price}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
});
