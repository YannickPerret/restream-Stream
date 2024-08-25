  "use client";
  import { useRouter } from 'next/navigation'
  import { useEffect } from 'react';
  import {useSessionStore} from "../../../../stores/useSessionStore";
  import LoginForm from "#components/forms/login.jsx";

  export default function Page() {
    const router = useRouter();
    const { isAuthenticated } = useSessionStore();

    useEffect(() => {
      if (isAuthenticated()) {
        router.push('/dashboard');
      }
    }, [isAuthenticated, router]);

    return (
        <section className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-900 via-gray-900 to-black w-full">
          <div className="bg-gradient-to-r from-purple-900 via-gray-800 to-gray-900 p-10 rounded-lg shadow-lg max-w-2xl w-full">
            <LoginForm />
          </div>
        </section>
    );
  }
