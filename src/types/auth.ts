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
