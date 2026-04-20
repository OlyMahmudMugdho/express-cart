import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PendingAuth = {
  userId: string | null;
  email: string | null;
  type: 'verification' | 'password_reset' | null;
};

type AuthContextType = {
  token: string | null;
  user: any | null;
  pendingAuth: PendingAuth;
  signIn: (email: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean; userId?: string }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => Promise<{ success: boolean; needsVerification: boolean; userId: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean }>;
  forgotPassword: (email: string) => Promise<{ success: boolean }>;
  resetPassword: (code: string, newPassword: string) => Promise<{ success: boolean }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  pendingAuth: { userId: null, email: null, type: null },
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false, needsVerification: false, userId: '' }),
  verifyOtp: async () => ({ success: false }),
  forgotPassword: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [pendingAuth, setPendingAuth] = useState<PendingAuth>({ userId: null, email: null, type: null });
  const [loading, setLoading] = useState(true);

  const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.warn('Error loading auth:', err);
    } finally {
      setLoading(false);
    }
  };

  async function signIn(email: string, password: string) {
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      console.log('AuthContext - Login response:', body);
      
      if (!res.ok) {
        alert(body.message || 'Login failed');
        return { success: false };
      }
      
      const token = body.accessToken ?? body.token ?? body.access_token ?? null;
      const user = body.user;
      
      console.log('AuthContext - Setting token:', token);
      console.log('AuthContext - Setting user:', user);
      
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (err) {
      console.warn('signIn error', err);
      return { success: false };
    }
  }

  async function signUp(email: string, password: string, firstName?: string, lastName?: string, phone?: string) {
    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, phone }),
      });
      const body = await res.json();
      
      if (!res.ok) {
        throw new Error(body.message || 'Registration failed');
      }
      
      setPendingAuth({ userId: body.userId, email, type: 'verification' });
      return { success: true, needsVerification: true, userId: body.userId };
    } catch (err) {
      console.warn('signUp error', err);
      return { success: false, needsVerification: false, userId: '' };
    }
  }

  async function verifyOtp(code: string) {
    if (!pendingAuth.userId || !pendingAuth.type) {
      return { success: false };
    }
    
    try {
      const res = await fetch(`${BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: pendingAuth.userId, 
          code, 
          type: pendingAuth.type 
        }),
      });
      const body = await res.json();
      
      if (!res.ok) {
        return { success: false };
      }
      
      if (pendingAuth.type === 'verification') {
        const loginRes = await fetch(`${BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: pendingAuth.email, password: '' }),
        });
        const loginBody = await loginRes.json();
        if (loginRes.ok) {
          setToken(loginBody.accessToken ?? loginBody.token ?? loginBody.access_token ?? null);
          setUser(loginBody.user ?? null);
        }
      }
      
      setPendingAuth({ userId: null, email: null, type: null });
      return { success: true };
    } catch (err) {
      console.warn('verifyOtp error', err);
      return { success: false };
    }
  }

  async function forgotPassword(email: string) {
    try {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      
      if (!res.ok) {
        return { success: false };
      }
      
      setPendingAuth({ userId: body.userId, email, type: 'password_reset' });
      return { success: true };
    } catch (err) {
      console.warn('forgotPassword error', err);
      return { success: false };
    }
  }

  async function resetPassword(code: string, newPassword: string) {
    if (!pendingAuth.userId || !pendingAuth.type) {
      return { success: false };
    }
    
    try {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: pendingAuth.userId, 
          code, 
          newPassword 
        }),
      });
      const body = await res.json();
      
      if (!res.ok) {
        return { success: false };
      }
      
      setPendingAuth({ userId: null, email: null, type: null });
      return { success: true };
    } catch (err) {
      console.warn('resetPassword error', err);
      return { success: false };
    }
  }

  function signOut() {
    AsyncStorage.removeItem('auth_token');
    AsyncStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setPendingAuth({ userId: null, email: null, type: null });
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      pendingAuth,
      signIn, 
      signUp, 
      verifyOtp, 
      forgotPassword, 
      resetPassword,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}