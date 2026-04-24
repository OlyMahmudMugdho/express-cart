import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { Image } from 'expo-image';

export default function ProductCard({ item }: { item: any }) {
  const image = item.images?.find((img: any) => img.isPrimary)?.url || item.images?.[0]?.url;

  return (
    <Link href={{ pathname: '/(tabs)/shop/product_detail', params: { id: item.id } }} asChild>
      <Pressable 
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed
        ]}
      >
        <Image 
          source={{ uri: image }} 
          style={styles.image} 
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <View style={styles.content}>
          <Text style={styles.category} numberOfLines={1}>{item.category?.name || 'Category'}</Text>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <View style={styles.footer}>
            <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
            {item.soldCount > 0 && (
               <Text style={styles.soldCount}>{item.soldCount} sold</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: 170,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 14,
  },
  category: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  soldCount: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
