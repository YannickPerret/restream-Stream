import { Home, ListVideo, SquareGanttChart, Tv2, Video } from "lucide-react";

export default function Navigator() {
  return (
    <nav className="flex-1 p-5 space-y-2">
      <a href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <Home size={20} /> Home
      </a>
      <a href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <Tv2 size={20} /> Streams
      </a>
      <a href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <SquareGanttChart size={20} /> Timelines
      </a>
      <a href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <ListVideo size={20} /> Playlists
      </a>
      <a href="#" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md align-baseline">
        <Video size={20} /> Vidéos
      </a>
    </nav>
  )
}