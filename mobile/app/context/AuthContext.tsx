import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  token: string | null;
  user: any | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  signIn: async () => false,
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  async function signIn(email: string, password: string) {
    try {
      const res = await fetch(`${getBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const body = await res.json();
      setToken(body.accessToken ?? body.token ?? body.access_token ?? null);
      setUser(body.user ?? null);
      return true;
    } catch (err) {
      console.warn('signIn error', err);
      return false;
    }
  }

  function signOut() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function getBaseUrl() {
  // Development default - change if backend runs on another host
  return 'http://localhost:3000';
}
