import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useApi } from './utils/api';

export default function Cart() {
  const api = useApi();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getCart();
        setItems(res.items ?? []);
      } catch (err) {
        console.warn(err);
      }
    })();
  }, []);

  if (!items.length) return <Text style={{ margin: 16 }}>Cart is empty</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1 }}>
            <Text>{item.product.name} x {item.quantity}</Text>
          </View>
        )}
      />
      <Button style={{ marginTop: 16 }} mode="contained">Checkout</Button>
    </View>
  );
}
