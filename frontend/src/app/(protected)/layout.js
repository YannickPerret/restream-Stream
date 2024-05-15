"use client";
import { useSessionStore } from "#stores/useSessionStore";
import { redirect } from 'next/navigation'


export default function RootLayout({ children, error }) {
  const { isAuthenticated } = useSessionStore();

    if (!isAuthenticated()) {
      redirect('/login')
    }

  return (
    children
  );
}
