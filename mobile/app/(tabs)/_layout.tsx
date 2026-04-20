import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0F172A' }}>
      <Tabs.Screen
        name="shop"
        options={{ 
            title: 'Shop', 
            headerShown: false, 
            tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} /> 
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{ title: 'Cart', tabBarIcon: ({ color }) => <Ionicons name="basket" size={24} color={color} /> }}
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
