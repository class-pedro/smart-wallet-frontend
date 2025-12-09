import { apiClient } from '@/lib/apiClient';

type GetCardTypesPayload = {
  token: string | null;
  walletId: string | null;
};

export async function getCardTypes({
  token,
  walletId,
}: GetCardTypesPayload): Promise<{ id: string; name: string }[]> {
  return apiClient(`/cards/cards-to-input?walletId=${walletId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
