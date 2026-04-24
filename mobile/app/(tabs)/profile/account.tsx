import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../utils/api';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import Skeleton from '../../components/Skeleton';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, showArrow = true }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
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
    </TouchableOpacity>
  );
}

export default function Account() {
  const { user, signOut, token, isLoading: authLoading } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const fetchOrdersCount = useCallback(async () => {
    try {
      const res = await api.getOrders();
      const orders = res.orders ?? res;
      setOrdersCount(Array.isArray(orders) ? orders.length : 0);
    } catch (err) {
      console.warn(err);
      setOrdersCount(0);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (token) {
      fetchOrdersCount();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading, fetchOrdersCount]);

  const onRefresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    await fetchOrdersCount();
    setRefreshing(false);
  }, [token, fetchOrdersCount]);

  const handleLogout = () => {
    signOut();
  };

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';

  const ProfileSkeleton = () => (
    <View style={styles.contentContainer}>
      <View style={styles.profileHeader}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <Skeleton width="40%" height={24} style={{ marginTop: 12 }} />
        <Skeleton width="60%" height={16} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Skeleton width={40} height={24} />
          <Skeleton width={50} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Skeleton width={40} height={24} />
          <Skeleton width={50} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Skeleton width={40} height={24} />
          <Skeleton width={50} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      {[1, 2].map((i) => (
        <View key={i} style={{ marginBottom: 24 }}>
          <Skeleton width="30%" height={14} style={{ marginBottom: 8, marginLeft: 4 }} />
          <View style={styles.menuCard}>
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
              <Skeleton width={36} height={36} borderRadius={10} />
              <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {isFocused && <StatusBar style="dark" />}
        <ProfileSkeleton />
      </View>
    );
  }

  if (!user || !token) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {isFocused && <StatusBar style="dark" />}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.contentContainer} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {}} tintColor="#0f172a" />
          }
        >
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
              <Button 
                mode="outlined" 
                style={styles.secondaryButton} 
                contentStyle={styles.buttonContent}
                textColor="#0f172a"
              >
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
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isFocused && <StatusBar style="dark" />}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f172a" colors={["#0f172a"]} />
        }
      >
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
          <Text style={styles.sectionTitle}>My Activity</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="cube" 
              title="My Orders" 
              subtitle="View your order history"
              onPress={() => router.push('/profile/orders')}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="location" 
              title="Addresses" 
              subtitle="Manage delivery addresses"
              onPress={() => router.push('/profile/addresses')}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="create" 
              title="Edit Profile" 
              subtitle="Update your personal information"
              onPress={() => router.push('/profile/edit')}
            />
          </View>
        </View>

        <Button 
          mode="outlined" 
          onPress={handleLogout} 
          style={styles.logoutButton} 
          textColor="#ef4444"
        >
          Sign Out
        </Button>
      </ScrollView>
    </View>
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
    height: '60%',
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
  },
  menuSection: {
    marginBottom: 24,
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
    marginTop: 0,
    borderColor: '#ef4444',
    borderRadius: 12,
  },
});
