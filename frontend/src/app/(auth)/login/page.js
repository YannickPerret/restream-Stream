  "use client";
  import { useRouter } from 'next/navigation'
  import { useEffect } from 'react';
  import {useSessionStore} from "../../../../stores/useSessionStore";
  import LoginForm from "../../../../components/forms/login";

  export default function Page() {
    const router = useRouter();
    const { isAuthenticated } = useSessionStore();

    useEffect(() => {
      if (isAuthenticated()) {
        router.push('/dashboard');
      }
    }, [isAuthenticated, router]);


    return (
       <LoginForm />
    );
  }
