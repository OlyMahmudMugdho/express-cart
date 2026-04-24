import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../utils/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Skeleton from '../../components/Skeleton';
import Toast from '../../components/Toast';

export default function EditProfile() {
  const { user, updateUser: updateAuthUser } = useAuth();
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.getProfile();
      setFirstName(res.firstName || '');
      setLastName(res.lastName || '');
      setPhone(res.phone || '');
      updateAuthUser(res);
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    } finally {
      setPageLoading(false);
    }
  }, [api, updateAuthUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  const handleUpdate = async () => {
    if (!firstName.trim()) {
      setToastMessage('First name is required');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    setLoading(true);
    try {
      const res = await api.updateProfile({ firstName, lastName, phone });
      updateAuthUser(res);
      setToastMessage('Profile updated successfully');
      setToastType('success');
      setToastVisible(true);
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to update profile');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const EditSkeleton = () => (
    <View style={styles.form}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.inputGroup}>
          <Skeleton width={80} height={14} style={{ marginLeft: 4, marginBottom: 4 }} />
          <Skeleton width="100%" height={56} borderRadius={12} />
        </View>
      ))}
      <Skeleton width="100%" height={60} borderRadius={12} style={{ marginTop: 8 }} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      <Toast 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {pageLoading ? (
        <EditSkeleton />
      ) : (
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f172a" colors={["#0f172a"]} />
          }
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                outlineColor="#e2e8f0"
                activeOutlineColor="#0f172a"
                textColor="#0f172a"
                contentStyle={styles.inputContent}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                outlineColor="#e2e8f0"
                activeOutlineColor="#0f172a"
                textColor="#0f172a"
                contentStyle={styles.inputContent}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor="#e2e8f0"
                activeOutlineColor="#0f172a"
                textColor="#0f172a"
                contentStyle={styles.inputContent}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>
                Your email address (${user?.email}) cannot be changed.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {!pageLoading && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Button 
            mode="contained" 
            onPress={handleUpdate} 
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            buttonColor="#0f172a"
            textColor="#fff"
          >
            Save Changes
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => router.back()} 
            style={styles.cancelButton}
            textColor="#64748b"
          >
            Cancel
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  form: { padding: 24, gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: '#64748b', marginLeft: 4 },
  input: { backgroundColor: '#fff' },
  inputContent: { fontSize: 16, fontWeight: '500' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: '#64748b', lineHeight: 18, fontWeight: '500' },
  footer: { padding: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 12 },
  saveButton: { borderRadius: 16, height: 54, justifyContent: 'center' },
  cancelButton: { borderRadius: 16, height: 54, justifyContent: 'center', borderColor: '#e2e8f0' },
});
