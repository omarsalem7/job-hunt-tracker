import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const processAuthToken = async () => {
            try {
                // Extract token from URL hash fragment (#token=xyz)
                const hash = window.location.hash;
                const params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
                const token = params.get('token');

                // 🛡️ Immediately sanitize the browser URL to avoid persisting JWT in history/referer
                if (window.history.replaceState) {
                    window.history.replaceState(null, '', window.location.pathname);
                }

                if (!token) {
                    throw new Error('No authentication token received from Google.');
                }

                // Hydrate auth session & fetch user profile
                await loginWithToken(token);

                if (isMounted) {
                    navigate('/', { replace: true });
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
                }
            }
        };

        processAuthToken();

        return () => {
            isMounted = false;
        };
    }, [loginWithToken, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                {error ? (
                    <div className="space-y-6">
                        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Authentication Failed</h2>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                {error}
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition duration-150"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 py-6">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent"></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Authenticating with Google...
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Securing your session and redirecting you to your dashboard.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
