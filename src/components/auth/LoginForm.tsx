import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GoogleLoginButton } from './GoogleLoginButton';

export function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(searchParams.get('error'));
    const [successMessage] = useState<string | null>(searchParams.get('message'));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setNeedsVerification(false);
        setIsSubmitting(true);

        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to sign in';
            setError(msg);
            if (msg.toLowerCase().includes('verify your email')) {
                setNeedsVerification(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Welcome back! Enter your credentials.
                    </p>
                </div>

                {successMessage && (
                    <div className="p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 space-y-2">
                        <p>{error}</p>
                        {needsVerification && (
                            <Link
                                to={`/verify-email?email=${encodeURIComponent(email)}`}
                                className="inline-flex items-center text-xs font-semibold text-red-700 dark:text-red-300 hover:underline"
                            >
                                Enter verification code &rarr;
                            </Link>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            disabled={isSubmitting}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg shadow transition duration-150 cursor-pointer"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="relative flex items-center justify-center my-4">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    <span className="absolute px-3 bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                        Or continue with
                    </span>
                </div>

                <GoogleLoginButton disabled={isSubmitting} />

                <div className="text-center pt-2">
                    <Link
                        to="/register"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Don't have an account? Create one
                    </Link>
                </div>
            </div>
        </div>
    );
}
