import { apiClient } from '@/lib/apiClient';

type GetDashboardPayload = {
  token: string | null;
  walletId: string | null;
  month: number;
  year: number;
};

export async function getDashboard({
  token,
  walletId,
  month,
  year,
}: GetDashboardPayload) {
  if (!token) throw new Error('Token inválido');
  if (!walletId) throw new Error('Carteiira não encontrada!');
  return apiClient(
    `/expenses/dash?walletId=${walletId}&month=${month}&year=${year}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
