import { Home, ListVideo, LogIn, SquareGanttChart, Tv2, Video } from "lucide-react";
import Link from "next/link";

export default function Navigator() {
  return (
    <nav className="flex-1 p-5 space-y-2">
      <Link href="/" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <Home size={20} /> Home
      </Link>
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
      <Link href="/login" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <LogIn size={20} /> Login
      </Link>
    </nav>
  )
}