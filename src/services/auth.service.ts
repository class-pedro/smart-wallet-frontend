import { apiClient } from '@/lib/apiClient';
import { LoginPayload } from '@/types/user';

export async function login(
  payload: LoginPayload
): Promise<{ access_token: string }> {
  return apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function me(token: string): Promise<{ walletId: string }> {
  return apiClient('/auth/me', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
