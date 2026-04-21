import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Button, Card, IconButton, Portal, Modal, TextInput, ActivityIndicator } from 'react-native-paper';
import { useApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Addresses() {
  const api = useApi();
  const { token } = useAuth();
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

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Addresses</Text>
        <Button mode="contained" onPress={() => setModalVisible(true)} style={styles.addButton}>
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
                <IconButton icon="delete-outline" iconColor="#ef4444" onPress={() => handleDeleteAddress(item.id)} />
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
          <Text style={styles.modalTitle}>Add New Address</Text>
          <TextInput label="Address Label (e.g. Home, Office)" value={form.label} onChangeText={(t) => setForm({ ...form, label: t })} style={styles.input} />
          <TextInput label="Street" value={form.street} onChangeText={(t) => setForm({ ...form, street: t })} style={styles.input} />
          <TextInput label="City" value={form.city} onChangeText={(t) => setForm({ ...form, city: t })} style={styles.input} />
          <TextInput label="State" value={form.state} onChangeText={(t) => setForm({ ...form, state: t })} style={styles.input} />
          <TextInput label="Postal Code" value={form.postalCode} onChangeText={(t) => setForm({ ...form, postalCode: t })} style={styles.input} />
          <TextInput label="Country" value={form.country} onChangeText={(t) => setForm({ ...form, country: t })} style={styles.input} />
          <Button mode="contained" onPress={handleAddAddress} loading={saving} style={styles.saveButton} buttonColor="#0f172a">
            Save Address
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  addButton: { borderRadius: 8 },
  list: { padding: 16 },
  card: { marginBottom: 12, borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  street: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  details: { fontSize: 14, color: '#64748b', marginTop: 2 },
  defaultBadge: { color: '#1677ff', fontSize: 12, fontWeight: '600', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: '#94a3b8' },
  modal: { backgroundColor: '#fff', padding: 20, margin: 20, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#0f172a' },
  input: { marginBottom: 12, backgroundColor: '#f8fafc' },
  saveButton: { marginTop: 8, borderRadius: 8 },
});
