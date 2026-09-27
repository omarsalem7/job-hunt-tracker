const BASE_URL = 'http://localhost:3000';
const TOKEN_KEY = 'job_hunt_token';

// Helper to manage token in localStorage
export const tokenStorage = {
    get: (): string | null => localStorage.getItem(TOKEN_KEY),
    set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
    clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

interface FetchOptions extends Omit<RequestInit, 'body'> {
    data?: unknown; // Request payload to be automatically serialized to JSON
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { data, headers, ...customConfig } = options;

    const token = tokenStorage.get();

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method: customConfig.method || 'GET',
        headers: {
            ...defaultHeaders,
            ...headers,
        },
        ...customConfig,
    };

    if (data !== undefined) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message =
            Array.isArray(errorBody.message)
                ? errorBody.message.join(', ')
                : errorBody.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}
