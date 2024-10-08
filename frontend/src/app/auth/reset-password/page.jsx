'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import AuthApi from '#api/auth';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [passwordRetry, setPasswordRetry] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (password !== passwordRetry) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('token', token);
            formData.append('password', password)
            await AuthApi.resetPassword(formData);
            router.push('/auth/login');
            setSuccessMessage('Your password has been reset. You can now log in.');
        } catch (error) {
            setErrorMessage(`Error resetting password: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-screen flex">
            {/* Section gauche avec SVG */}
            <div className="hidden lg:flex w-1/2 bg-black text-white flex-col justify-center relative">
                <Image
                    src="/auth/right.svg"
                    alt="Decorative background"
                    layout="fill"
                    objectFit="cover"
                    className="absolute inset-0 w-full h-full"
                />
                <div className="relative z-10 p-12">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-4xl font-bold mb-6">Stream When You're Offline &</h1>
                        <h2 className="text-3xl font-bold text-purple-400 mb-6">Maximize Your Reach!</h2>
                        <p className="text-lg mb-4">
                            Turn your content into a revenue machine! With our cutting-edge platform, schedule your VODs to
                            stream on your own Twitch, YouTube, TikTok, and Facebook channels, even while you're offline.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section droite avec le formulaire */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-12">
                <div className="max-w-md mx-auto">
                    <h2 className="text-4xl font-bold text-purple-400 mb-6">Reset Password</h2>
                    <p className="text-gray-500 mb-6">
                        Enter your new password and confirm it below.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your new password"
                                className="w-full px-4 py-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password Retry Input */}
                        <div>
                            <label htmlFor="passwordRetry" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                id="passwordRetry"
                                type="password"
                                placeholder="Confirm your new password"
                                className="w-full px-4 py-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                value={passwordRetry}
                                onChange={e => setPasswordRetry(e.target.value)}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                className={`w-full py-3 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors duration-200 ${isSubmitting ? 'opacity-50' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}