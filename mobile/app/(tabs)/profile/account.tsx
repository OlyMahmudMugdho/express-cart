import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { Link, useRouter } from 'expo-router';

export default function Account() {
  const { user, signOut, token } = useAuth();
  const router = useRouter();

  console.log('Profile - user:', user, 'token:', token);

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';

  if (!user || !token) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to access your orders, favorites, and account settings.</Text>
        </View>
        <View style={styles.actions}>
          <Link href="/profile/login" asChild>
            <Button mode="contained" style={styles.primaryButton} contentStyle={styles.buttonContent} textColor="#fff">
              Sign In
            </Button>
          </Link>
          <Link href="/profile/register" asChild>
            <Button mode="outlined" style={styles.secondaryButton} contentStyle={styles.buttonContent}>
              Create Account
            </Button>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.profileTitle}>Welcome, {displayName}!</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <View style={styles.menu}>
        <Button mode="text" style={styles.menuItem} contentStyle={styles.menuContent}>My Orders</Button>
        <Button mode="text" style={styles.menuItem} contentStyle={styles.menuContent}>Wishlist</Button>
        <Button mode="text" style={styles.menuItem} contentStyle={styles.menuContent}>Addresses</Button>
        <Button mode="text" style={styles.menuItem} contentStyle={styles.menuContent}>Settings</Button>
      </View>
      <Button 
        mode="outlined" 
        onPress={() => { signOut(); router.push('/profile'); }} 
        style={styles.logoutButton} 
        textColor="#ef4444"
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  secondaryButton: {
    borderRadius: 12,
    borderColor: '#0f172a',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#64748b',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
  },
  menuItem: {
    borderRadius: 0,
  },
  menuContent: {
    justifyContent: 'flex-start',
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#ef4444',
    borderRadius: 12,
  },
});