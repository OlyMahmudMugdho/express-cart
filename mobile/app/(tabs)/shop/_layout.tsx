import { Stack } from 'expo-router';

export default function ShopLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="shop" />
      <Stack.Screen name="product_detail" />
    </Stack>
  );
}
