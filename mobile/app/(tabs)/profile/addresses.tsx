import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, Card, IconButton, Portal, Modal, TextInput, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Addresses() {
  const api = useApi();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  const fetchAddresses = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getAddresses();
      setAddresses(res);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  const handleAddAddress = async () => {
    if (!form.street || !form.city || !form.country) return;
    setSaving(true);
    try {
      await api.addAddress(form);
      setModalVisible(false);
      setForm({ label: '', street: '', city: '', state: '', postalCode: '', country: '', isDefault: false });
      fetchAddresses();
    } catch (err) {
      console.warn(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      console.warn(err);
    }
  };

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#0f172a" />
    </View>
  );

  return (
    <View style={styles.container}>
      {isFocused && <StatusBar style="dark" />}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <Button mode="contained" onPress={() => setModalVisible(true)} style={styles.addButton} buttonColor="#0f172a" textColor="#fff">
          Add New
        </Button>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{item.label || 'Address'}</Text>
                  <Text style={styles.street}>{item.street}</Text>
                </View>
                <IconButton icon="trash-can-outline" iconColor="#ef4444" onPress={() => handleDeleteAddress(item.id)} />
              </View>
              <Text style={styles.details}>{item.city}, {item.state} {item.postalCode}</Text>
              <Text style={styles.details}>{item.country}</Text>
              {item.isDefault && <Text style={styles.defaultBadge}>Default Address</Text>}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No addresses added yet.</Text>}
      />

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <IconButton icon="close" size={24} onPress={() => setModalVisible(false)} />
            </View>
            
            <View style={styles.form}>
              <TextInput 
                label="Label (e.g. Home, Office)" 
                mode="outlined"
                value={form.label} 
                onChangeText={(t) => setForm({ ...form, label: t })} 
                style={styles.input} 
                outlineColor="#e2e8f0"
                activeOutlineColor="#0f172a"
              />
              <TextInput 
                label="Street Address" 
                mode="outlined"
                value={form.street} 
                onChangeText={(t) => setForm({ ...form, street: t })} 
                style={styles.input} 
                outlineColor="#e2e8f0"
                activeOutlineColor="#0f172a"
              />
              <View style={styles.row}>
                <TextInput 
                  label="City" 
                  mode="outlined"
                  value={form.city} 
                  onChangeText={(t) => setForm({ ...form, city: t })} 
                  style={[styles.input, { flex: 1 }]} 
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#0f172a"
                />
                <TextInput 
                  label="State" 
                  mode="outlined"
                  value={form.state} 
                  onChangeText={(t) => setForm({ ...form, state: t })} 
                  style={[styles.input, { flex: 1 }]} 
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#0f172a"
                />
              </View>
              <View style={styles.row}>
                <TextInput 
                  label="Postal Code" 
                  mode="outlined"
                  value={form.postalCode} 
                  onChangeText={(t) => setForm({ ...form, postalCode: t })} 
                  style={[styles.input, { flex: 1 }]} 
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#0f172a"
                />
                <TextInput 
                  label="Country" 
                  mode="outlined"
                  value={form.country} 
                  onChangeText={(t) => setForm({ ...form, country: t })} 
                  style={[styles.input, { flex: 1 }]} 
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#0f172a"
                />
              </View>
              
              <Button 
                mode="contained" 
                onPress={handleAddAddress} 
                loading={saving} 
                style={styles.saveButton} 
                buttonColor="#0f172a"
                textColor="#fff"
                contentStyle={{ paddingVertical: 6 }}
              >
                Save Address
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  addButton: { borderRadius: 10, paddingHorizontal: 4 },
  list: { padding: 16 },
  card: { marginBottom: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  street: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  details: { fontSize: 14, color: '#64748b', marginTop: 2 },
  defaultBadge: { color: '#2563eb', fontSize: 12, fontWeight: '700', marginTop: 10, backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  empty: { textAlign: 'center', marginTop: 80, color: '#94a3b8', fontSize: 15 },
  modal: { backgroundColor: '#fff', padding: 20, margin: 16, borderRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  form: { gap: 4 },
  row: { flexDirection: 'row', gap: 12 },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  saveButton: { marginTop: 12, borderRadius: 12 },
});
