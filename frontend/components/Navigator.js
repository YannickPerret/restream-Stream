'use client';
import Link from "next/link";
import { useSessionStore } from "../stores/useSessionStore";
import LogoutForm from "./forms/logout";
import { useEffect, useState } from "react";

export default function Navigator() {
  const { isAuthenticated } = useSessionStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Remove or adjust based on actual auth check
      setIsAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!isAuthChecked) {
    return (
      <nav className="flex-1 p-5 space-y-2">
        <span>Loading...</span>
      </nav>
    );
  }

  return (
    <nav className="flex-1 p-5 space-y-2">
      <Link href="/" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <span>Home</span>
      </Link>
      {isAuthenticated() ? (
        <>
          <Link href="/streams" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
            <span>Streams</span>
          </Link>
          <Link href="/providers" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
            <span>Providers</span>
          </Link>
          <Link href="/timelines" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
            <span>Timelines</span>
          </Link>
          <Link href="/playlists" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
            <span>Playlists</span>
          </Link>
          <Link href="/videos" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
            <span>Vidéos</span>
          </Link>
          <LogoutForm />
        </>
      ) : (
        <Link href="/login" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
          <span>Login</span>
        </Link>
      )}
    </nav>
  )
}