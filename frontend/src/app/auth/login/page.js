"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from "#stores/useAuthStore.js";
import Image from "next/image.js";
import Link from "next/link.js";
import AuthApi from "#api/auth.js";
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setUser, setToken, setAuthenticated, redirectAfterLogin, clearRedirectAfterLogin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirige l'utilisateur vers la page précédente ou le dashboard s'il n'y en a pas
      const destination = clearRedirectAfterLogin() || '/dashboard';
      router.push(destination);
    }
  }, [isAuthenticated, router, clearRedirectAfterLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await AuthApi.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      setAuthenticated(true);
    } catch (error) {
      setError('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
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

        {/* Section droite */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-4xl font-bold text-sky-400 mb-6">Login</h2>
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
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full px-4 py-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                  />
                  <button
                      type="button"
                      className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500 "
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="mt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors duration-200 ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>

              {/* Links */}
              <div className="mt-6 space-y-2">
                <p className="text-gray-500">
                  Don't Have An Account?{' '}
                  <Link href={"/auth/register"} className="text-purple-500 hover:underline">
                    Sign Up
                  </Link>
                </p>
                <p>
                  <Link href={"/auth/forgot-password"} className="text-purple-500 hover:underline">
                    Forgot Password?
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
  );
}