import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function EditProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSave = async () => {
    if (!firstName.trim()) {
      setSnackbarMessage('First name is required');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbarMessage('Profile updated successfully');
      setSnackbarVisible(true);
      setTimeout(() => router.replace('/profile/account'), 1500);
    } catch (err) {
      setSnackbarMessage('Failed to update profile');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.replace('/profile/account');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
              placeholder="Enter first name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              mode="outlined"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              placeholder="Enter last name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              mode="outlined"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              mode="outlined"
              value={user?.email || ''}
              style={[styles.input, styles.disabledInput]}
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
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 20,
  },
  saveButton: {
    borderRadius: 10,
  },
  cancelButton: {
    borderRadius: 10,
    borderColor: '#64748b',
  },
});