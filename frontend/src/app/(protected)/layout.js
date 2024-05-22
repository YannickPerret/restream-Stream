"use client";
import { useSessionStore } from "#stores/useSessionStore";
import { redirect } from 'next/navigation'
import { useEffect } from 'react';


export default function RootLayout({ children, error }) {
  const { isAuthenticated } = useSessionStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      redirect('/login')
    }
    }, [isAuthenticated])

  return (
    children
  );
}
