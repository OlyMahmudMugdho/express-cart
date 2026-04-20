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
    async register(payload: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    async verifyOtp(userId: string, code: string, type: 'verification' | 'password_reset' | 'email_change') {
      const res = await fetch(`${BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId, code, type }),
      });
      return res.json();
    },
    async forgotPassword(email: string) {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email }),
      });
      return res.json();
    },
    async resetPassword(userId: string, code: string, newPassword: string) {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId, code, newPassword }),
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
