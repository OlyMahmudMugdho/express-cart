import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../utils/api';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, showArrow = true }: MenuItemProps) {
  return (
    <Button mode="text" onPress={onPress} style={styles.menuItem} contentStyle={styles.menuContent}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon as any} size={20} color="#0f172a" />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        {showArrow && <Ionicons name="chevron-forward" size={20} color="#94a3b8" />}
      </View>
    </Button>
  );
}

export default function Account() {
  const { user, signOut, token } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (token) {
      fetchOrdersCount();
    }
  }, [token]);

  const fetchOrdersCount = async () => {
    try {
      const res = await api.getOrders();
      const orders = res.orders ?? res;
      setOrdersCount(Array.isArray(orders) ? orders.length : 0);
    } catch (err) {
      console.warn(err);
      setOrdersCount(0);
    }
  };

  const handleLogout = () => {
    signOut();
  };

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';

  if (!user || !token) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>Welcome to ExpressCart</Text>
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
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={24} color="#0f172a" />
            <Text style={styles.featureText}>Secure Checkout</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color="#0f172a" />
            <Text style={styles.featureText}>Wishlist</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="time" size={24} color="#0f172a" />
            <Text style={styles.featureText}>Order Tracking</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{ordersCount}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <TouchableOpacity 
          style={styles.statItem} 
          onPress={() => router.push('/profile/orders')}
        >
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Addresses</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>My Orders</Text>
        <View style={styles.menuCard}>
          <MenuItem 
            icon="cube" 
            title="My Orders" 
            subtitle="View your order history"
            onPress={() => router.push('/profile/orders')}
          />
          <Divider />
          <MenuItem 
            icon="heart" 
            title="Wishlist" 
            subtitle="Your saved items"
          />
          <Divider />
          <MenuItem 
            icon="location" 
            title="Addresses" 
            subtitle="Manage delivery addresses"
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem 
            icon="settings" 
            title="Settings" 
            subtitle="App preferences"
          />
          <Divider />
          <MenuItem 
            icon="help-circle" 
            title="Help & Support" 
            subtitle="Get assistance"
          />
          <Divider />
          <MenuItem 
            icon="document-text" 
            title="Terms & Privacy" 
            subtitle="Legal information"
            showArrow={false}
          />
        </View>
      </View>

      <Button 
        mode="outlined" 
        onPress={handleLogout} 
        style={styles.logoutButton} 
        textColor="#ef4444"
        icon="log-out"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
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
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    borderRadius: 0,
  },
  menuContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: '#ef4444',
    borderRadius: 12,
  },
});