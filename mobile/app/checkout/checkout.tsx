import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useApi } from '../utils/api';

export default function Checkout() {
  const api = useApi();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await api.placeOrder();
      if (res.order) {
        Alert.alert('Success', 'Order placed successfully!');
        router.replace('/(tabs)/profile/orders');
      } else {
        Alert.alert('Error', 'Failed to place order.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Order Summary" />
        <Card.Content>
          <Text>Cash on Delivery</Text>
          <Divider style={styles.divider} />
          <Button 
            mode="contained" 
            onPress={handlePlaceOrder} 
            loading={loading}
            style={styles.button}
          >
            Confirm Order
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16 },
  divider: { marginVertical: 16 },
  button: { marginTop: 16 },
});
