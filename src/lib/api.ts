const normalizeBaseUrl = (value?: string) => {
  if (!value) return 'http://localhost:4000';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

const getAuthToken = () => localStorage.getItem('auth_token');

const buildHeaders = (optionsHeaders?: HeadersInit, token?: string | null) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
  ...optionsHeaders,
});

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text;
};

const handleError = async (response: Response) => {
  const data = await parseResponse(response);
  const message = typeof data === 'object' && data !== null && 'message' in data
    ? (data as { message: string }).message
    : `API Error: ${response.status}`;
  throw new Error(message);
};

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers = buildHeaders(options.headers, token);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      await handleError(response);
    }

    return parseResponse(response);
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};
