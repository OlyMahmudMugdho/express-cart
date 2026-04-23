import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../utils/api';
import * as Haptics from 'expo-haptics';

export default function EditProfile() {
  const router = useRouter();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const { user, updateUser, token, isLoading: authLoading } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('#0f172a');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (token && !authLoading) {
      fetchProfile();
    }
  }, [token, authLoading]);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setPhone(data.phone || '');
      updateUser(data);
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      setSnackbarMessage('First name is required');
      setSnackbarColor('#ef4444');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await api.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      
      await updateUser(updatedUser);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSnackbarMessage('Profile updated successfully');
      setSnackbarColor('#0f172a');
      setSnackbarVisible(true);
      setTimeout(() => router.replace('/profile/account'), 1500);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSnackbarMessage(err.message || 'Failed to update profile');
      setSnackbarColor('#ef4444');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.replace('/profile/account');
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              mode="outlined"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              outlineColor="#e2e8f0"
              activeOutlineColor="#0f172a"
              textColor="#0f172a"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              mode="outlined"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              outlineColor="#e2e8f0"
              activeOutlineColor="#0f172a"
              textColor="#0f172a"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              mode="outlined"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              outlineColor="#e2e8f0"
              activeOutlineColor="#0f172a"
              textColor="#0f172a"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              mode="outlined"
              value={user?.email || ''}
              style={[styles.input, styles.disabledInput]}
              outlineColor="#e2e8f0"
              textColor="#64748b"
              disabled
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
            buttonColor="#0f172a"
            textColor="#fff"
          >
            Save Changes
          </Button>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            textColor="#64748b"
          >
            Cancel
          </Button>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={[styles.snackbar, { backgroundColor: snackbarColor }]}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  content: { flex: 1, padding: 20 },
  form: { gap: 12 },
  inputGroup: { marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 6 },
  input: { backgroundColor: '#fff' },
  disabledInput: { backgroundColor: '#f1f5f9' },
  helperText: { fontSize: 12, color: '#64748b', marginTop: 4 },
  buttonContainer: { gap: 10, marginTop: 20 },
  saveButton: { borderRadius: 10 },
  cancelButton: { borderRadius: 10, borderColor: '#64748b' },
  snackbar: { borderRadius: 12, marginHorizontal: 16, marginBottom: 24 },
  snackbarText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
