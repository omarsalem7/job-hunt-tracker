import { apiClient, tokenStorage } from './client';
import type {
    AuthUser,
    AuthResponse,
    RegisterResponse,
    AuthCredentials,
    VerifyEmailPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    MessageResponse,
    ResetPasswordResponse,
} from '../types';

export type {
    AuthUser,
    AuthResponse,
    RegisterResponse,
    AuthCredentials,
    VerifyEmailPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    MessageResponse,
    ResetPasswordResponse,
};

export const authApi = {
    register: async (credentials: AuthCredentials): Promise<RegisterResponse> => {
        const response = await apiClient<RegisterResponse>('/auth/register', {
            method: 'POST',
            data: credentials,
        });
        if (response.accessToken) {
            tokenStorage.set(response.accessToken);
        }
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

    verifyEmail: async (payload: VerifyEmailPayload): Promise<AuthResponse> => {
        const response = await apiClient<AuthResponse>('/auth/verify-email', {
            method: 'POST',
            data: payload,
        });
        if (response.accessToken) {
            tokenStorage.set(response.accessToken);
        }
        return response;
    },

    resendOtp: async (email: string): Promise<MessageResponse> => {
        return apiClient<MessageResponse>('/auth/resend-otp', {
            method: 'POST',
            data: { email },
        });
    },

    forgotPassword: async (email: string): Promise<MessageResponse> => {
        return apiClient<MessageResponse>('/auth/forgot-password', {
            method: 'POST',
            data: { email },
        });
    },

    resetPassword: async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
        return apiClient<ResetPasswordResponse>('/auth/reset-password', {
            method: 'POST',
            data: payload,
        });
    },

    getMe: async (): Promise<AuthUser> => {
        return apiClient<AuthUser>('/auth/me');
    },

    logout: (): void => {
        tokenStorage.clear();
    },
};
