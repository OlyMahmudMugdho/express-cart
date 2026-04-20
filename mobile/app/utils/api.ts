import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';

const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export function useApi() {
  const { token } = useAuth();

  const headers = (extra: Record<string,string> = {}) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  return {
    async getProducts() {
      const res = await fetch(`${BASE}/products`);
      return res.json();
    },
    async getProduct(id: string) {
      const res = await fetch(`${BASE}/products/${id}`);
      return res.json();
    },
    async login(email: string, password: string) {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    },
    async register(payload: any) {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    async addToCart(productId: string, quantity = 1) {
      const res = await fetch(`${BASE}/cart/items`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ productId, quantity }),
      });
      return res.json();
    },
    async getCart() {
      const res = await fetch(`${BASE}/cart`, { headers: headers() });
      return res.json();
    },
  };
}
