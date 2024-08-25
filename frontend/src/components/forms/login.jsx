import { useState } from "react";
import AuthApi from "../../../api/auth";
import { useRouter} from "next/navigation";
import {useSessionStore} from "../../../stores/useSessionStore";
import Form from "./handleForm/form";
import FormGroup from "./handleForm/formGroup";

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
        <form onSubmit={handleSubmit} className="space-y-20">
            <h2 className="text-3xl font-bold text-white text-center">Login to CoffeeStream</h2>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-gray-300">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-gray-300">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <div className="mt-6">
                <button
                    type="submit"
                    className="w-full py-3 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors duration-200"
                >
                    Login
                </button>
            </div>
        </form>
    );
}
