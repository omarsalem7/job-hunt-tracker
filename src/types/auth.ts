export interface AuthUser {
    id: number;
    email: string;
    createdAt?: string;
    updatedAt?: string;
    isEmailVerified?: boolean;
}

export interface AuthResponse {
    message?: string;
    user: AuthUser;
    accessToken: string;
}

export interface RegisterResponse {
    message: string;
    user: AuthUser;
    accessToken?: string;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface VerifyEmailPayload {
    email: string;
    code: string;
}

export interface ResendOtpPayload {
    email: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    email: string;
    code: string;
    password: string;
}

export interface MessageResponse {
    message: string;
    expiresAt?: string;
}

export interface ResetPasswordResponse {
    message: string;
    user: AuthUser;
}
