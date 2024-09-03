"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";
import AuthApi from "#api/auth.js";
import { useSessionStore } from "#stores/useSessionStore.js";

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRetry, setPasswordRetry] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const { setSession } = useSessionStore();
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      }).then((data) => {
        setError('Thanks for registering. Check your email to confirm your account.');
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
      <section className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-900 via-gray-900 to-black w-full">
        <div className="bg-gradient-to-r from-purple-900 via-gray-800 to-gray-900 p-10 rounded-lg shadow-lg w-4/6 my-24">
          <h1 className="text-4xl font-bold text-white text-center mb-8">Register a New Account</h1>
          {error && (
              <div className="text-red-500 text-center mb-6">{error}</div>
          )}
          <Form onSubmit={handleSubmit}>
            <FormGroup type="column" title={"Account Information"}>
              <label htmlFor="username" className="block text-white mt-4">Username</label>
              <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  className="w-full p-3 mt-2 mb-4 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={username}
                  required={true}
                  onChange={(e) => setUsername(e.target.value)}
              />

              <label htmlFor="email" className="block text-white mt-4">Email</label>
              <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="w-full p-3 mt-2 mb-4 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={email}
                  required={true}
                  onChange={(e) => setEmail(e.target.value)}
              />

              <label htmlFor="password" className="block text-white mt-4">Password</label>
              <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className={`w-full p-3 mt-2 mb-4 bg-gray-800 border ${passwordError ? 'border-red-500' : 'border-gray-700'} rounded focus:outline-none focus:ring-2 focus:ring-purple-600`}
                  value={password}
                  required={true}
                  onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && (
                  <div className="text-red-500 text-sm mt-2">{passwordError}</div>
              )}

              <label htmlFor="passwordRetry" className="block text-white mt-4">Password Retry</label>
              <input
                  type="password"
                  id="passwordRetry"
                  placeholder="Retry Password"
                  className={`w-full p-3 mt-2 mb-4 bg-gray-800 border ${passwordError ? 'border-red-500' : 'border-gray-700'} rounded focus:outline-none focus:ring-2 focus:ring-purple-600`}
                  value={passwordRetry}
                  required={true}
                  onChange={(e) => setPasswordRetry(e.target.value)}
              />
            </FormGroup>

            <div className="mt-6">
              <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                Create Your Account
              </button>
            </div>
          </Form>
        </div>
      </section>
  );
}
