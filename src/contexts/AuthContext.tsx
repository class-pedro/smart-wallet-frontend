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
import { login, me } from '@/services/auth.service';

type AuthContextData = {
  token: string | null;
  walletId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletId, setWalletId] = useState<string | null>(null);

  const loadToken = useCallback(() => {
    setIsLoading(true);
    const cookies = parseCookies();
    setToken(cookies['t'] ?? null);
    setIsLoading(false);
  }, []);

  const loadWalletId = useCallback(() => {
    setIsLoading(true);
    const cookies = parseCookies();
    setWalletId(cookies['wid'] ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadToken();
    loadWalletId();
  }, [loadToken, loadWalletId]);

  const signIn = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const loginResponse = await login(payload);

      if (!loginResponse.access_token) throw new Error('Falha ao obter token!');

      setCookie(null, 't', loginResponse.access_token, {
        path: '/',
        maxAge: 60 * 60,
      });
      setToken(loginResponse.access_token);

      const meResponse = await me(loginResponse.access_token);

      if (!meResponse.walletId)
        throw new Error('Falha ao obter dados do usuário!');
      setCookie(null, 'wid', meResponse.walletId, {
        path: '/',
        maxAge: 60 * 60,
      });
      setWalletId(meResponse.walletId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    destroyCookie(null, 't', { path: '/' });
    destroyCookie(null, 'wid', { path: '/' });
    setWalletId(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      walletId,
      isAuthenticated: !!token,
      isLoading,
      signIn,
      logout,
    }),
    [token, isLoading, signIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
