import { Stack, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';
import AuthProvider from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}
