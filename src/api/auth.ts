import { apiClient, tokenStorage } from './client';

export interface AuthUser {
    id: number;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    message?: string;
    user: AuthUser;
    accessToken: string;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export const authApi = {
    register: async (credentials: AuthCredentials): Promise<AuthResponse> => {
        const response = await apiClient<AuthResponse>('/auth/register', {
            method: 'POST',
            data: credentials,
        });
        tokenStorage.set(response.accessToken);
        return response;
    },

    login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
        const response = await apiClient<AuthResponse>('/auth/login', {
            method: 'POST',
            data: credentials,
        });
        tokenStorage.set(response.accessToken);
        return response;
    },

    getMe: async (): Promise<AuthUser> => {
        return apiClient<AuthUser>('/auth/me');
    },

    logout: (): void => {
        tokenStorage.clear();
    },
};
