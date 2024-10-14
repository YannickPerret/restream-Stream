"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthApi from "#api/auth.js";
import Image from "next/image";
import Link from "next/link";
import ReCaptcha from "#components/reCaptcha/reCaptcha.jsx";

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRetry, setPasswordRetry] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const isVerifyStep = searchParams.get('s') === 'verify';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordRetry) {
      setError('Passwords do not match');
      return;
    }
    try {
      await AuthApi.register({
        email,
        password,
        passwordRetry,
        username,
      }).then(() => {
        // Après l'inscription réussie, rediriger vers l'étape de vérification
        router.push('/auth/register?s=verify');
      });
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (password && passwordRetry) {
      if (password !== passwordRetry) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  }, [password, passwordRetry]);

  return (
      <div className="min-h-screen flex">
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
                Turn your content into a revenue machine! With our cutting-edge platform, schedule your VODs to stream on your own Twitch, YouTube, TikTok, and Facebook channels, even while you're offline.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-12">
          <div className="max-w-md mx-auto">
            {isVerifyStep ? (
                <div className="p-8 bg-white rounded-lg shadow-lg text-center">
                  <h2 className="text-4xl font-bold text-sky-400 mb-6">Verify Your Email</h2>
                  <p className="text-gray-500 mb-6">
                    Thank you for creating an account. A confirmation email has been sent to your inbox. Please check your email to confirm your account.
                  </p>
                    <p className="mt-6 text-gray-500">
                      Don't receive the email ? Look in your spam folder
                    </p>
                </div>
            ) : (
                <>
                  <h2 className="text-4xl font-bold text-sky-400 mb-6">Create An Account</h2>
                  <p className="text-gray-500 mb-6">
                    Create Your Account And Get Exciting New Features and Explore the New Automation
                  </p>
                  <form className="space-y-6" onSubmit={handleSubmit}>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                          type="text"
                          id="username"
                          placeholder="Username"
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-400 focus:border-purple-400 sm:text-sm"
                          value={username}
                          required={true}
                          onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                          type="email"
                          id="email"
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-400 focus:border-purple-400 sm:text-sm"
                          placeholder="youremail@gmail.com"
                          value={email}
                          required={true}
                          onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                          type="password"
                          id="password"
                          placeholder="Password"
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-400 focus:border-purple-400 sm:text-sm"
                          value={password}
                          required={true}
                          onChange={(e) => setPassword(e.target.value)}
                      />
                      {passwordError && (
                          <div className="text-red-500 text-sm mt-2">{passwordError}</div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="passwordRetry" className="block text-sm font-medium text-gray-700">Password Retry</label>
                      <input
                          type="password"
                          id="passwordRetry"
                          placeholder="Retry Password"
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-400 focus:border-purple-400 sm:text-sm"
                          value={passwordRetry}
                          required={true}
                          onChange={(e) => setPasswordRetry(e.target.value)}
                      />
                    </div>

                    <ReCaptcha />

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-purple-500 text-white font-semibold rounded-md shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Create An Account
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Or <Link href="/auth/login" className="text-purple-500 hover:underline">Already Have An Account? Login</Link>
                    </p>
                  </div>
                </>
            )}
          </div>
        </div>
      </div>
  );
}