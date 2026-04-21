import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="account" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify_otp" />
      <Stack.Screen name="reset_password" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}