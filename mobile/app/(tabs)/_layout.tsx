import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 52 + insets.bottom : 58 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : (insets.bottom > 0 ? insets.bottom : 8),
          paddingTop: 4,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 2,
        },
        // Adding ripple effect for Android and opacity for iOS
        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={{ color: '#e2e8f0', borderless: true }}
            style={({ pressed }) => [
              props.style,
              { opacity: Platform.OS === 'ios' && pressed ? 0.6 : 1 }
            ]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="shop"
        options={{ 
            title: 'Shop', 
            headerShown: false, 
            tabBarIcon: ({ color, focused }) => (
               <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={color} /> 
            )
        }}
        listeners={{
          tabPress: () => {
            router.navigate('/(tabs)/shop/shop');
          },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{ 
          title: 'Cart', 
          headerShown: false, 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "basket" : "basket-outline"} size={24} color={color} /> 
          )
        }}
        listeners={{
          tabPress: () => {
            router.navigate('/(tabs)/cart/');
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ 
          title: 'Profile', 
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} /> 
          )
        }}
        listeners={{
          tabPress: () => {
            router.navigate('/(tabs)/profile/account');
          },
        }}
      />
    </Tabs>
  );
}
