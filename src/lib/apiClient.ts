const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Erro na requisição: ${res.status}`);
  }

  return res.json();
}
