import { useState } from "react";
import AuthApi from "../../api/auth";
import { useRouter} from "next/navigation";
import {useSessionStore} from "../../stores/useSessionStore";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setSession } = useSessionStore()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AuthApi.login({email, password})
        .then((data) => {
          setSession(data)
          router.push('/dashboard')
        });
    } catch (error) {
      setError('Error logging in. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm p-4 mx-auto bg-white rounded shadow-md text-black">
      <h1 className="text-3xl font-bold">Login to CoffeeStream</h1>
      {error && <p className="text-red-500">{error}</p>}
      <label htmlFor="email" className="block mt-4">Email</label>
      <input
        id="email"
        type="email"
        placeholder="Email"
        className="w-full p-2 my-4 border border-gray-300 rounded"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label htmlFor="password" className="block">Password</label>
      <input
        id="password"
        type="password"
        placeholder="Password"
        className="w-full p-2 my-4 border border-gray-300 rounded"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="w-full p-2 my-4 text-white bg-blue-500 rounded">
        Login
      </button>
    </form>
  );
}
