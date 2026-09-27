import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type AuthUser, type AuthCredentials } from '../api/auth';
import { tokenStorage } from '../api/client';

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: AuthCredentials) => Promise<void>;
    register: (credentials: AuthCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = tokenStorage.get();
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const currentUser = await authApi.getMe();
                setUser(currentUser);
            } catch (error) {
                console.warn('Session expired or invalid token:', error);
                tokenStorage.clear();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: AuthCredentials) => {
        const res = await authApi.login(credentials);
        setUser(res.user);
    };

    const register = async (credentials: AuthCredentials) => {
        const res = await authApi.register(credentials);
        setUser(res.user);
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
