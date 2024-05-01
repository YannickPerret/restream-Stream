'use client';
import { Home, ListVideo, LogIn, LogOut, SquareGanttChart, Tv2, Video } from "lucide-react";
import Link from "next/link";
import useSessionStore from "../stores/useSessionStore";
import { useRouter } from 'next/navigation'

export default function Navigator() {
  const isAuthenticated = useSessionStore(state => state.isAuthenticated());
  const session = useSessionStore(state => state.session);
  const router = useRouter();

  async function handleLogout(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": session ? `${session.token.type} ${session.token.token}` : "",
        },

      });

      if (response.ok) {
        useSessionStore.getState().logout();
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error', error);
    }
  }

  return (
    <nav className="flex-1 p-5 space-y-2">
      <Link href="/" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <Home size={20} /> Home
      </Link>
      {isAuthenticated ? (
        <>
      <Link href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <Tv2 size={20} /> Streams
      </Link>
      <Link href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <SquareGanttChart size={20} /> Timelines
      </Link>
      <Link href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <ListVideo size={20} /> Playlists
      </Link>
      <Link href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <Video size={20} /> Vidéos
      </Link>
      <button
        type="button"
        className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline"
        onClick={handleLogout}
      >
        <LogOut size={20} /> Logout
      </button>
        </>
        ) : (
      <Link href="/login" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <LogIn size={20} /> Login
      </Link>
        )}
    </nav>
  )
}