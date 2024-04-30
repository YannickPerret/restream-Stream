"use client";
import { useRouter } from 'next/navigation'
import { useState } from 'react';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  // Pour stocker et afficher les messages d'erreur
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token.token);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error(error);
      setError('Une erreur est survenue');
    }
  }

  return (
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-4 mx-auto bg-white rounded shadow-md text-black">
        <h1 className="text-3xl font-bold">Login to CoffeeStream</h1>
        {error && <p className="text-red-500">{error}</p>}
        <label htmlFor={email} className="block mt-4">Email</label>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 my-4 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor={password} className="block">Password</label>
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 my-4 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full p-2 my-4 text-white bg-blue-500 rounded">
          Login
        </button>
      </form>
  );
}
