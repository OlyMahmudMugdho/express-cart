import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { Link } from 'expo-router';

export default function Profile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.subtitle}>Log in or register to manage your orders and profile.</Text>
        <Link href="/auth/login" asChild>
          <Button mode="contained" style={styles.button}>Login / Register</Button>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      <Button mode="outlined" onPress={signOut} style={styles.button}>Logout</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  info: { fontSize: 16, marginBottom: 24 },
  button: { marginTop: 16 },
});
