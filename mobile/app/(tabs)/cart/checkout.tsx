import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Divider, Snackbar, RadioButton, ActivityIndicator, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useApi } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

interface NewAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

function SectionTitle({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={sectionTitleStyles.container}>
      <Ionicons name={icon as any} size={22} color="#0f172a" />
      <Text style={sectionTitleStyles.text}>{title}</Text>
    </View>
  );
}

const sectionTitleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
});

export default function Checkout() {
  const api = useApi();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddress>({
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
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
      if (res.length > 0) {
        const defaultAddr = res.find((a: any) => a.isDefault) || res[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setFetchingAddresses(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !showNewAddress) {
      setSnackbarMessage('Please select a shipping address');
      setSnackbarColor('#ef4444');
      setSnackbarVisible(true);
      return;
    }

    if (showNewAddress) {
      if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.country) {
        setSnackbarMessage('Please fill in all address fields');
        setSnackbarColor('#ef4444');
        setSnackbarVisible(true);
        return;
      }
    }

    setLoading(true);
    try {
      const addressPayload = showNewAddress ? {
        label: newAddress.label || 'Home',
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
        phone: newAddress.phone,
      } : undefined;

      const res = await api.placeOrder(
        showNewAddress ? undefined : selectedAddressId || undefined, 
        undefined, 
        addressPayload,
        paymentMethod
      );
      
      if (paymentMethod === 'stripe' && res.checkoutSessionUrl) {
        setLoading(false);
        const orderNumber = res.order?.orderNumber;
        
        await WebBrowser.openBrowserAsync(res.checkoutSessionUrl);
        
        // After browser closes, start polling
        setWaitingForPayment(true);
        pollOrderStatus(orderNumber);
        return;
      }

      if (res.order) {
        const orderNumber = res.order?.orderNumber || 'ORD-' + Date.now();
        router.push({
          pathname: '/cart/success',
          params: { orderNumber, paymentMethod: 'cod' },
        });
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

  const updateNewAddress = (field: keyof NewAddress, value: string) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
  };

  const pollOrderStatus = async (orderNumber: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5s interval
    
    const checkStatus = async () => {
      try {
        const res = await api.getOrderStatus(orderNumber);
        if (res.status === 'processing') {
          setWaitingForPayment(false);
          router.push({
            pathname: '/cart/success',
            params: { orderNumber, paymentMethod: 'stripe' },
          });
          return true;
        }
      } catch (err) {
        console.warn('Poll error:', err);
      }
      return false;
    };

    const interval = setInterval(async () => {
      attempts++;
      const finished = await checkStatus();
      if (finished || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!finished) {
          setWaitingForPayment(false);
          setSnackbarMessage('Payment confirmation timed out. Please check your orders.');
          setSnackbarColor('#f59e0b');
          setSnackbarVisible(true);
        }
      }
    }, 5000);
  };

  if (waitingForPayment) {
    return (
      <View style={styles.waitingContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.waitingTitle}>Waiting for Payment</Text>
        <Text style={styles.waitingSubtitle}>Please complete the payment in the browser window.</Text>
        <Button 
          mode="outlined" 
          onPress={() => setWaitingForPayment(false)}
          textColor="#0f172a"
          style={{ marginTop: 24, borderColor: '#0f172a' }}
        >
          Cancel Waiting
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <SectionTitle title="Shipping Address" icon="location-outline" />
            
            {fetchingAddresses ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0f172a" />
              </View>
            ) : (
              <>
                {addresses.length > 0 && !showNewAddress && (
                  <RadioButton.Group onValueChange={value => setSelectedAddressId(value)} value={selectedAddressId || ''}>
                    {addresses.map(addr => (
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
                    <TextInput
                      mode="outlined"
                      label="Phone (optional)"
                      value={newAddress.phone}
                      onChangeText={(text) => updateNewAddress('phone', text)}
                      style={styles.input}
                      keyboardType="phone-pad"
                    />
                    <View style={styles.formButtons}>
                      <Button 
                        mode="contained" 
                        onPress={handlePlaceOrder} 
                        loading={loading}
                        style={styles.primaryButton}
                        buttonColor="#0f172a"
                        textColor="#fff"
                      >
                        Save & Place Order
                      </Button>
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

                {!showNewAddress && (
                  <TouchableOpacity 
                    style={styles.addNewButton}
                    onPress={() => setShowNewAddress(true)}
                  >
                    <Ionicons name="add" size={20} color="#0f172a" />
                    <Text style={styles.addNewButtonText}>Add New Address</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.card, { marginTop: 16 }]}>
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

      {!showNewAddress && (
        <View style={styles.footer}>
          <Button 
            mode="contained" 
            onPress={handlePlaceOrder} 
            loading={loading}
            style={styles.confirmButton}
            buttonColor="#0f172a"
            textColor="#fff"
            disabled={!selectedAddressId}
          >
            Confirm Order
          </Button>
        </View>
      )}

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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  addressItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  addressItemSelected: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  addressRadioContainer: {
    marginRight: 4,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  addressStreet: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  addressCountry: {
    fontSize: 14,
    color: '#64748b',
  },
  defaultBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  newAddressForm: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  formButtons: {
    marginTop: 8,
    gap: 8,
  },
  primaryButton: {
    borderRadius: 8,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0f172a',
    borderStyle: 'dashed',
    gap: 8,
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  paymentOptionSelected: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  paymentMethodLabel: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  paymentMethodValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#e2e8f0',
  },
  secureNote: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  snackbar: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 6,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  waitingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 24,
    marginBottom: 8,
  },
  waitingSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});