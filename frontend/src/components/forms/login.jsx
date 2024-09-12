import Image from 'next/image';
import { useState } from "react";
import AuthApi from "../../../api/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "#stores/useAuthStore.js";
import Link from "next/link";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { setUser, setToken, setAuthenticated } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await AuthApi.login({ email, password }).then(async (data) => {
                setToken(data);
                const { user } = await AuthApi.getCurrentUser();
                setUser(user);
                setAuthenticated(true)
                console.log("login successful");
                router.push('/dashboard')
            });
        } catch (error) {
            setAuthenticated(false)
            setError('Error logging in. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Section with SVG */}
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
                        <h2 className="text-3xl font-bold text-purple-400 mb-6">Maximize Your Reach !</h2>
                        <p className="text-lg mb-4">
                            Turn your content into a revenue machine! With our cutting-edge platform, schedule your VODs to stream on your own Twitch, YouTube, TikTok, and Facebook channels, even while you're offline.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section - Full Width on Small Screens */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-12">
                <div className="max-w-md mx-auto">
                    <h2 className="text-4xl font-bold text-purple-400 mb-6">Login</h2>
                    <p className="text-gray-500 mb-6">
                        Create Your Account And Get Exciting New Features and Explore the New Automation
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-red-500 text-center">{error}</p>}

                        <div className="space-y-4">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    className="w-full px-4 py-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-4 py-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full py-3 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors duration-200"
                            >
                                Login
                            </button>
                        </div>

                        {/* Links */}
                        <div className="mt-6 space-y-2 text-center">
                            <p>
                                Don't Have An Account?{' '}
                                <Link href={"/auth/register"} className="text-purple-500 hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                            <p>
                                <Link href={"/auth/password-reset"} className="text-purple-500 hover:underline">
                                    Forgot Password?
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
