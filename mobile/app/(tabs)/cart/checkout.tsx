import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Text, Button, Card, Divider, Snackbar, RadioButton, TextInput } from 'react-native-paper';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useApi } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Skeleton from '../../components/Skeleton';

function SectionTitle({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={20} color="#0f172a" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function Checkout() {
  const router = useRouter();
  const api = useApi();
  const insets = useSafeAreaInsets();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
  
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    isDefault: false
  });

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('#0f172a');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.getAddresses();
      setAddresses(res);
      const def = res.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else if (res.length > 0) setSelectedAddressId(res[0].id);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const updateNewAddress = (key: string, value: any) => {
    setNewAddress(prev => ({ ...prev, [key]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!showNewAddress && !selectedAddressId) {
      setSnackbarMessage('Please select an address');
      setSnackbarColor('#ef4444');
      setSnackbarVisible(true);
      return;
    }

    if (showNewAddress && (!newAddress.street || !newAddress.city || !newAddress.country)) {
      setSnackbarMessage('Please fill all required address fields');
      setSnackbarColor('#ef4444');
      setSnackbarVisible(true);
      return;
    }

    setIsPlacingOrder(true);
    try {
      const res = await api.placeOrder(
        showNewAddress ? undefined : selectedAddressId!,
        '',
        showNewAddress ? newAddress : undefined,
        paymentMethod
      );

      if (paymentMethod === 'stripe' && res.checkoutUrl) {
        await WebBrowser.openBrowserAsync(res.checkoutUrl);
        router.replace({
          pathname: '/cart/success',
          params: { orderId: res.orderId, orderNumber: res.orderNumber }
        });
      } else {
        router.replace({
          pathname: '/cart/success',
          params: { orderId: res.id || res.orderId, orderNumber: res.orderNumber }
        });
      }
    } catch (err: any) {
      setSnackbarMessage(err.message || 'Failed to place order');
      setSnackbarColor('#ef4444');
      setSnackbarVisible(true);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const CheckoutSkeleton = () => (
    <View style={{ flex: 1, padding: 16 }}>
      <Card style={styles.card}>
        <Card.Content>
          <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={80} borderRadius={12} />
        </Card.Content>
      </Card>
      <Card style={[styles.card, { marginTop: 16 }]}>
        <Card.Content>
          <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={60} borderRadius={12} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={60} borderRadius={12} />
        </Card.Content>
      </Card>
    </View>
  );

  if (isPlacingOrder) {
    return (
      <View style={styles.waitingContainer}>
        <Skeleton width={100} height={100} borderRadius={50} />
        <Text style={styles.waitingTitle}>Processing Order</Text>
        <Text style={styles.waitingSubtitle}>Please wait while we confirm your order...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <CheckoutSkeleton />
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <SectionTitle title="Shipping Address" icon="location-outline" />
              
              {!showNewAddress && (
                <>
                  <RadioButton.Group onValueChange={value => setSelectedAddressId(value)} value={selectedAddressId || ''}>
                    {addresses.map((addr) => (
                      <TouchableOpacity 
                        key={addr.id}
                        onPress={() => setSelectedAddressId(addr.id)}
                        style={[
                          styles.addressItem,
                          selectedAddressId === addr.id && styles.addressItemSelected
                        ]}
                      >
                        <View style={styles.addressRadioContainer}>
                          <RadioButton value={addr.id} color="#0f172a" />
                        </View>
                        <View style={styles.addressContent}>
                          <Text style={styles.addressLabel}>{addr.label}</Text>
                          <Text style={styles.addressStreet}>{addr.street}</Text>
                          <Text style={styles.addressDetails}>
                            {addr.city}, {addr.state} {addr.postalCode}
                          </Text>
                          <Text style={styles.addressCountry}>{addr.country}</Text>
                        </View>
                        {addr.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </RadioButton.Group>
                  
                  <TouchableOpacity 
                    style={styles.addNewButton}
                    onPress={() => setShowNewAddress(true)}
                  >
                    <Ionicons name="add" size={20} color="#0f172a" />
                    <Text style={styles.addNewButtonText}>Add New Address</Text>
                  </TouchableOpacity>
                </>
              )}

              {showNewAddress && (
                <View style={styles.newAddressForm}>
                  <TextInput
                    mode="outlined"
                    label="Label (e.g., Home, Office)"
                    value={newAddress.label}
                    onChangeText={(text) => updateNewAddress('label', text)}
                    style={styles.input}
                  />
                  <TextInput
                    mode="outlined"
                    label="Street Address"
                    value={newAddress.street}
                    onChangeText={(text) => updateNewAddress('street', text)}
                    style={styles.input}
                  />
                  <View style={styles.row}>
                    <TextInput
                      mode="outlined"
                      label="City"
                      value={newAddress.city}
                      onChangeText={(text) => updateNewAddress('city', text)}
                      style={[styles.input, { flex: 1 }]}
                    />
                    <TextInput
                      mode="outlined"
                      label="State"
                      value={newAddress.state}
                      onChangeText={(text) => updateNewAddress('state', text)}
                      style={[styles.input, { flex: 1 }]}
                    />
                  </View>
                  <View style={styles.row}>
                    <TextInput
                      mode="outlined"
                      label="Postal Code"
                      value={newAddress.postalCode}
                      onChangeText={(text) => updateNewAddress('postalCode', text)}
                      style={[styles.input, { flex: 1 }]}
                    />
                    <TextInput
                      mode="outlined"
                      label="Country"
                      value={newAddress.country}
                      onChangeText={(text) => updateNewAddress('country', text)}
                      style={[styles.input, { flex: 1 }]}
                    />
                  </View>
                  <View style={styles.formButtons}>
                    <Button 
                      mode="text" 
                      onPress={() => setShowNewAddress(false)}
                      textColor="#64748b"
                    >
                      Cancel
                    </Button>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={[styles.card, { marginTop: 16, marginBottom: 100 }]}>
            <Card.Content>
              <SectionTitle title="Payment Method" icon="card-outline" />
              
              <RadioButton.Group onValueChange={value => setPaymentMethod(value as any)} value={paymentMethod}>
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('cod')}
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'cod' && styles.paymentOptionSelected
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <RadioButton value="cod" color="#0f172a" />
                    <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cod' ? "#0f172a" : "#64748b"} style={{ marginLeft: 8 }} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                      <Text style={styles.paymentOptionSubtitle}>Pay when you receive your order</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setPaymentMethod('stripe')}
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'stripe' && styles.paymentOptionSelected
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <RadioButton value="stripe" color="#0f172a" />
                    <Ionicons name="card-outline" size={24} color={paymentMethod === 'stripe' ? "#0f172a" : "#64748b"} style={{ marginLeft: 8 }} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.paymentOptionTitle}>Credit / Debit Card</Text>
                      <Text style={styles.paymentOptionSubtitle}>Secure payment via Stripe</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </RadioButton.Group>
              
              <Divider style={styles.divider} />
              
              <Text style={styles.secureNote}>
                <Ionicons name="lock-closed-outline" size={14} color="#64748b" /> 
                {paymentMethod === 'cod' ? ' Your order will be paid when delivered' : ' Your payment is processed securely'}
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handlePlaceOrder} 
          loading={isPlacingOrder}
          style={styles.confirmButton}
          buttonColor="#0f172a"
          textColor="#fff"
          disabled={!selectedAddressId && !showNewAddress}
        >
          Confirm Order
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: snackbarColor }]}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  addressItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  addressItemSelected: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  addressRadioContainer: { justifyContent: 'center' },
  addressContent: { flex: 1, marginLeft: 8 },
  addressLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  addressStreet: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginTop: 2 },
  addressDetails: { fontSize: 13, color: '#64748b' },
  addressCountry: { fontSize: 13, color: '#64748b' },
  defaultBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  defaultBadgeText: { fontSize: 10, fontWeight: '700', color: '#2563eb' },
  addNewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', gap: 8, marginTop: 4 },
  addNewButtonText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  newAddressForm: { gap: 4 },
  input: { marginBottom: 8, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 12 },
  formButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#f1f5f9', marginBottom: 12 },
  paymentOptionSelected: { borderColor: '#0f172a', backgroundColor: '#f8fafc' },
  paymentOptionTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  paymentOptionSubtitle: { fontSize: 12, color: '#64748b' },
  divider: { marginVertical: 16, backgroundColor: '#f1f5f9' },
  secureNote: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  footer: { padding: 16, paddingBottom: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', position: 'absolute', bottom: 0, left: 0, right: 0 },
  confirmButton: { borderRadius: 12, height: 48, justifyContent: 'center' },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  waitingTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 24 },
  waitingSubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 24 },
  snackbar: { borderRadius: 12, marginBottom: 80 },
});
