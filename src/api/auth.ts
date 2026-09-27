import { apiClient, tokenStorage } from './client';
import type { AuthUser, AuthResponse, AuthCredentials } from '../types';

export type { AuthUser, AuthResponse, AuthCredentials };

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
