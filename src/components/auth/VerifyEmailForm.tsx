import { useState, useEffect, useRef, type FormEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';

export function VerifyEmailForm() {
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(60);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const char = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = char;
        setOtp(newOtp);

        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter all 6 digits of the verification code.');
            return;
        }

        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setIsSubmitting(true);

        try {
            await verifyEmail({ email: email.trim(), code });
            navigate('/', { replace: true });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to verify email';
            setError(msg);
            // If no code exists or expired, remove cooldown so user can request immediately
            if (
                msg.toLowerCase().includes('no verification code found') ||
                msg.toLowerCase().includes('expired') ||
                msg.toLowerCase().includes('request a new')
            ) {
                setCooldown(0);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (cooldown > 0 || isResending) return;
        if (!email.trim()) {
            setError('Please provide a valid email address to resend the code.');
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setIsResending(true);

        try {
            const res = await authApi.resendOtp(email.trim());
            setSuccessMessage(res.message || 'Verification code resent successfully!');
            setCooldown(60);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to resend verification code';
            setError(msg);
            const match = msg.match(/wait (\d+) seconds/i);
            if (match) {
                setCooldown(parseInt(match[1], 10));
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                {/* Header icon and title */}
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        We sent a 6-digit verification code to
                    </p>
                    {email ? (
                        <p className="font-semibold text-gray-900 dark:text-gray-200 text-sm mt-0.5 break-all">
                            {email}
                        </p>
                    ) : (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Please specify your registered email below
                        </p>
                    )}
                </div>

                {successMessage && (
                    <div className="p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 space-y-2">
                        <p>{error}</p>
                        {cooldown === 0 && (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isResending}
                                className="inline-flex items-center text-xs font-semibold text-red-700 dark:text-red-300 hover:underline cursor-pointer disabled:opacity-50"
                            >
                                {isResending ? 'Sending...' : 'Request a new code now →'}
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!searchParams.get('email') && (
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
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                            Enter 6-digit code
                        </label>
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-11 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                                    disabled={isSubmitting}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || otp.join('').length !== 6}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg shadow transition duration-150 cursor-pointer"
                    >
                        {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                </form>

                {/* Resend Code Action */}
                <div className="text-center pt-1 border-t border-gray-100 dark:border-gray-700/60">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Didn't receive the email?{' '}
                        {cooldown > 0 ? (
                            <span className="text-gray-400 dark:text-gray-500 font-medium">
                                Resend in <span className="tabular-nums font-semibold">{cooldown}s</span>
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isResending}
                                className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer disabled:opacity-50"
                            >
                                {isResending ? 'Sending...' : 'Resend code'}
                            </button>
                        )}
                    </p>
                </div>

                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        &larr; Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
