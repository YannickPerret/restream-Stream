  "use client";
  import { useRouter } from 'next/navigation'
  import { useEffect } from 'react';
  import {useSessionStore} from "../../../../stores/useSessionStore";
  import LoginForm from "@/components/forms/login";

  export default function Page() {
    const router = useRouter();
    const { isAuthenticated } = useSessionStore();

    useEffect(() => {
      if (isAuthenticated()) {
        router.push('/dashboard');
      }
    }, [isAuthenticated, router]);

    return (
        <section className="container mx-auto px-4 bg-gray-600">
          <div className="w-full lg:w-9/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0">
              <LoginForm />

            </div>
          </div>
        </section>
    );
  }
