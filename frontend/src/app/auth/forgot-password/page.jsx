'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthApi from "#api/auth.js";

export default function AuthForgotPassword() {
    const [email, setEmail] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage('');
        setErrorMessage('');

        try {
            const formdata = new FormData();
            formdata.append('email', email);
            await AuthApi.forgotPassword(formdata);
            setStatusMessage('A reset link has been sent to your email.');
            setErrorMessage('')
        } catch (error) {
            setErrorMessage(`Failed to send reset link: ${error.message}`);
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
                            Turn your content into a revenue machine! With our cutting-edge platform, schedule your VODs
                            to stream on your own Twitch, YouTube, TikTok, and Facebook channels, even while you're
                            offline.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section droite avec le formulaire */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-12">
                <div className="max-w-md mx-auto">
                    <h2 className="text-4xl font-bold text-purple-400 mb-6">Forgot Password</h2>
                    <p className="text-gray-500 mb-6">
                        Enter your email address and we will send you a link to reset your password.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {statusMessage && <p className="text-green-500 text-center">{statusMessage}</p>}
                        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors duration-200 ${isSubmitting ? 'opacity-50' : ''}`}>
                                {isSubmitting ? 'Sending reset link...' : 'Send Reset Link'}
                            </button>
                        </div>

                        {/* Links */}
                        <div className="mt-6 space-y-2">
                            <p className="text-gray-500">
                                Remember your password?{' '}
                                <Link href={"/auth/login"} className="text-purple-500 hover:underline">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
