import React from 'react';
import { StyleSheet, View, ImageBackground, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';
import { useAssets } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  const [assets] = useAssets([require('../assets/banner.jpg')]);
  const bannerSource = assets?.[0] ? { uri: assets[0].localUri ?? assets[0].uri } : null;
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.heroContainer}>
        {bannerSource ? (
          <ImageBackground
            source={bannerSource}
            resizeMode="cover"
            style={styles.heroBanner}
          >
            <View style={styles.overlay} />
          </ImageBackground>
        ) : (
          <View style={[styles.heroBanner, styles.placeholder]} />
        )}
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.brand}>ExpressCart</Text>
          <Text style={styles.heading}>Elevate Your{'\n'}Daily Shopping</Text>
          <Text style={styles.subheading}>
            Discover curated collections, latest trends, and seamless secure checkout.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/shop')}>
          <Text style={styles.buttonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroContainer: {
    height: '55%',
    width: '100%',
  },
  heroBanner: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  placeholder: {
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  brand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heading: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 44,
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    maxWidth: '90%',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0F172A',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
