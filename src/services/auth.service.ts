import { apiClient } from '@/lib/apiClient';
import { LoginPayload } from '@/types/user';

export async function login(payload: LoginPayload) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
