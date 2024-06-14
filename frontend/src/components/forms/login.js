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
    <Form onSubmit={handleSubmit} title={"Login to CoffeeStream"}>
        <FormGroup title="User Identification">
            <label htmlFor="email" className="block mt-4">Email</label>
            <input
                id="email"
                type="email"
                placeholder="Email"
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />

            <label htmlFor="password" className="block">Password</label>
            <input
                id="password"
                type="password"
                placeholder="Password"
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
        </FormGroup>
        <div className="text-center mt-6">
            <button
                type="submit"
                className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150">
                Login
            </button>
        </div>
    </Form>
  );
}
