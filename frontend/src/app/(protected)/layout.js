"use client";
import { useSessionStore } from "../../../stores/useSessionStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootLayout({ children, error }) {
  const { isAuthenticated } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    children
  );
}
