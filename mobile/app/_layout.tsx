import { Stack } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';
import AuthProvider from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </AuthProvider>
  );
}
