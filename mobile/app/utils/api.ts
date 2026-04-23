import { useAuth } from '../context/AuthContext';
import { CONFIG } from '../config';

export function useApi() {
  const { token, isLoading } = useAuth();
  const BASE = CONFIG.API_URL;

  const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (!isLoading && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  return {
    async getProducts(params?: { page?: number; limit?: number; categoryId?: string; search?: string; sort?: string }) {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, value.toString());
          }
        });
      }
      const res = await fetch(`${BASE}/products?${query.toString()}`);
      return res.json();
    },
    async getCategories() {
      const res = await fetch(`${BASE}/categories`);
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
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add to cart');
      }
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
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update cart');
      }
      return res.json();
    },
    async removeCartItem(itemId: string) {
      const res = await fetch(`${BASE}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to remove from cart');
      }
      return res.json();
    },
    async addToCartGuest(productId: string, quantity = 1) {
      const res = await fetch(`${BASE}/cart/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add to cart');
      }
      return res.json();
    },
    async placeOrder(addressId?: string, notes?: string, newAddress?: any, paymentMethod: 'cod' | 'stripe' = 'cod') {
      const res = await fetch(`${BASE}/checkout/place-order`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId, notes, newAddress, paymentMethod }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to place order');
      }
      return res.json();
    },
    async getOrderStatus(orderNumber: string) {
      const res = await fetch(`${BASE}/checkout/orders/${orderNumber}/status`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error('Failed to fetch order status');
      }
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
    async getAddresses() {
      const h = getHeaders();
      if (!h.Authorization) return [];
      try {
        const res = await fetch(`${BASE}/users/addresses`, { headers: h });
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
    async addAddress(payload: any) {
      const res = await fetch(`${BASE}/users/addresses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add address');
      }
      return res.json();
    },
    async deleteAddress(id: string) {
      const res = await fetch(`${BASE}/users/addresses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error('Failed to delete address');
      }
      return res.json();
    },
    async updateProfile(payload: { firstName?: string; lastName?: string; phone?: string }) {
      const res = await fetch(`${BASE}/users/profile`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return res.json();
    },
    async getProfile() {
      const res = await fetch(`${BASE}/users/profile`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      return res.json();
    },
  };
}
