import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useApi } from '../utils/api';

export default function Checkout() {
  const api = useApi();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('#0f172a');

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await api.placeOrder();
      if (res.order) {
        setSnackbarMessage('Order placed successfully!');
        setSnackbarColor('#22c55e');
        setSnackbarVisible(true);
        setTimeout(() => {
          router.replace('/(tabs)/profile/orders');
        }, 1500);
      } else {
        setSnackbarMessage('Failed to place order.');
        setSnackbarColor('#ef4444');
        setSnackbarVisible(true);
      }
    } catch (err: any) {
      setSnackbarMessage(err.message || 'Something went wrong.');
      setSnackbarColor('#ef4444');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
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
              buttonColor="#0f172a"
              textColor="#fff"
            >
              Confirm Order
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: snackbarColor }]}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 12 },
  divider: { marginVertical: 16 },
  button: { marginTop: 16, borderRadius: 8 },
  snackbar: {
    backgroundColor: '#0f172a',
    bottom: 20,
  },
});
