'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { LoginPayload } from '@/types/user';
import { login } from '@/services/auth.service';

type AuthContextData = {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega token dos cookies na primeira renderização
  useEffect(() => {
    const cookies = parseCookies();
    setToken(cookies['t'] ?? null);
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (payload: LoginPayload) => {
    const data = await login(payload);

    if (!data.access_token) {
      throw new Error('Falha ao obter token!');
    }
    setCookie(null, 't', data.access_token, {
      path: '/',
      maxAge: 60 * 60,
    });
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    destroyCookie(null, 't', { path: '/' });
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      isLoading,
      signIn,
      logout,
    }),
    [token, isLoading, signIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
