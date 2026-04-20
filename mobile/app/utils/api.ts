import { useAuth } from '../context/AuthContext';

const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export function useApi() {
  const { token, isLoading } = useAuth();

  const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (!isLoading && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

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
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    },
    async register(payload: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    async verifyOtp(userId: string, code: string, type: 'verification' | 'password_reset' | 'email_change') {
      const res = await fetch(`${BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, code, type }),
      });
      return res.json();
    },
    async forgotPassword(email: string) {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return res.json();
    },
    async resetPassword(userId: string, code: string, newPassword: string) {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, code, newPassword }),
      });
      return res.json();
    },
    async addToCart(productId: string, quantity = 1) {
      const res = await fetch(`${BASE}/cart/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      return res.json();
    },
    async getCart() {
      const h = getHeaders();
      console.log('getCart - hasAuth:', !!h.Authorization);
      if (!h.Authorization) {
        return { items: [] };
      }
      try {
        const res = await fetch(`${BASE}/cart`, { headers: h });
        if (!res.ok) return { items: [] };
        return res.json();
      } catch {
        return { items: [] };
      }
    },
    async updateCartItem(itemId: string, quantity: number) {
      const res = await fetch(`${BASE}/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ quantity }),
      });
      return res.json();
    },
    async removeCartItem(itemId: string) {
      const res = await fetch(`${BASE}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.json();
    },
    async addToCartGuest(productId: string, quantity = 1) {
      const res = await fetch(`${BASE}/cart/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      return res.json();
    },
    async getOrders() {
      const h = getHeaders();
      console.log('getOrders - hasAuth:', !!h.Authorization);
      if (!h.Authorization) {
        console.log('No auth token!');
        return [];
      }
      try {
        const res = await fetch(`${BASE}/checkout/orders`, { headers: h });
        console.log('getOrders status:', res.status);
        if (!res.ok) {
          console.log('getOrders failed');
          return [];
        }
        return res.json();
      } catch (err) {
        console.log('getOrders error:', err);
        return [];
      }
    },
  };
}