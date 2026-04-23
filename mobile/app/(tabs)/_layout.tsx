import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0F172A' }}>
      <Tabs.Screen
        name="shop"
        options={{ 
            title: 'Shop', 
            headerShown: false, 
            tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} /> 
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(tabs)/shop/shop');
          },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{ 
          title: 'Cart', 
          headerShown: false, 
          tabBarIcon: ({ color }) => <Ionicons name="basket" size={24} color={color} /> 
        }}
        listeners={{
          tabPress: (e) => {
            // Force navigation to the cart index screen
            e.preventDefault();
            router.push('/(tabs)/cart/');
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ 
          title: 'Profile', 
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> 
        }}
      />
    </Tabs>
  );
}
