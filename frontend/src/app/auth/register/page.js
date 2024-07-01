"use client";
import { useRouter } from 'next/navigation'
import {useEffect, useState} from 'react';
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";
import AuthApi from "#api/auth.js";
import {useSessionStore} from "#stores/useSessionStore.js";

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRetry, setPasswordRetry] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const { setSession } = useSessionStore()
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
        firstName,
        lastName,
        phone
      }).then((data) => {
        setError('Thanks for registering. Check your email to confirm your account.')
      });
    } catch (error) {
      console.error(error);
      setError(error.message)
    }
  }

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
      <section className="container mx-auto px-4 bg-gray-600">
        <div className="w-full lg:w-9/12 px-4">
            <h1 className="text-3xl font-bold text-white">Register a new account</h1>
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0">

            {error && (
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-blueGray-400 text-center mb-3 font-bold">
                    {error}
                </div>
            </div>
            )}

            <Form onSubmit={handleSubmit} className="w-full max-w-sm p-4 mx-auto bg-white rounded shadow-md text-black">
              <FormGroup type="column" title={"Account Information"}>
                <label htmlFor={username} className="block mt-4">Username</label>
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 my-4 border border-gray-300 rounded"
                    value={username}
                    required={true}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor={email} className="block mt-4">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 my-4 border border-gray-300 rounded"
                    value={email}
                    required={true}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor={password} className="block">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    className={`w-full p-2 my-4 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded`}
                    value={password}
                    required={true}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                    <div className="text-red-500 text-sm mt-2">{passwordError}</div>
                )}
                <label htmlFor={passwordRetry} className="block">Password retry</label>
                <input
                    type="password"
                    placeholder="Password-retry"
                    className={`w-full p-2 my-4 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded`}
                    value={passwordRetry}
                    required={true}
                    onChange={(e) => setPasswordRetry(e.target.value)}
                />
              </FormGroup>

              <FormGroup type="column" title={"Personal Information"}>
                <FormGroup>
                  <label htmlFor={firstName} className="block mt-4">First Name (optionnel)</label>
                  <input
                      type="text"
                      placeholder="First Name"
                      className="w-full p-2 my-4 border border-gray-300 rounded"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                  />
                  <label htmlFor={lastName} className="block mt-4">Last Name (optionnel)</label>
                  <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full p-2 my-4 border border-gray-300 rounded"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                  />
                </FormGroup>
                <label htmlFor={phone} className="block mt-4">Phone (optionnel)</label>
                <input
                    type="text"
                    placeholder="Phone"
                    className="w-full p-2 my-4 border border-gray-300 rounded"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
              </FormGroup>

              <FormGroup title={"Validation"}>
                <button
                    type="submit"
                    className="w-full p-2 my-4 text-white bg-blue-500 rounded">
                  Create your account
                </button>
              </FormGroup>
            </Form>
          </div>
        </div>
      </section>
  );
}
