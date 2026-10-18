const BASE_URL = '/api';

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  message?: string;
  lockoutSeconds?: number;
}

export async function apiRequest<T = any>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  token?: string | null
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authToken = token || localStorage.getItem('shikshasetu_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.error || 'RequestFailed',
        message: data.message || 'An error occurred while communicating with the server.',
        lockoutSeconds: data.lockoutSeconds,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: 'NetworkError',
      message: 'Network unreachable. Your device may be offline.',
    };
  }
}
