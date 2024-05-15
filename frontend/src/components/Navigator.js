'use client';
import Link from "next/link";
import { useSessionStore } from "../../stores/useSessionStore";
import LogoutForm from "./forms/logout";
import { useEffect, useState } from "react";
import {Home, ListVideo, LogIn, Plus, SquareGanttChart, Tv2, Wrench, Youtube} from "lucide-react";

export default function Navigator() {
    const { isAuthenticated } = useSessionStore();
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            setIsAuthChecked(true);
        };
        checkAuth();
    }, []);

    if (!isAuthChecked) {
        return null;
    }

    return (
        <nav className="flex flex-col flex-1 px-5 py-9 bg-sky-500 gap-4">
            <Link href="/" className="flex gap-2 p-2 text-xl hover:bg-gray-700 rounded-md text-white">
                <Home /> Home
            </Link>
            {isAuthenticated() ? (
                <>
                    <div className="relative group ">
                        <Link href="/streams" className="flex gap-2 p-2 text-xl text-white hover:bg-gray-700 rounded-md"><Tv2 /> Streams</Link>
                        <div className="absolute left-0 hidden group-hover:block flex flex-col text-white z-10 bg-sky-600 w-full">
                            <Link href="/streams/create" className="flex p-2 hover:bg-gray-700 rounded-l text-l"><Plus />Create</Link>
                        </div>
                    </div>
                    <div className="relative group">
                        <Link href="/providers" className="flex gap-2 text-xl p-2 text-white hover:bg-gray-700 rounded-md"><Wrench />Providers</Link>
                        <div className="absolute left-0 hidden group-hover:block flex flex-col text-white z-10 bg-sky-600 w-full">
                            <Link href="/providers/create" className="flex px-4 py-2 hover:bg-gray-700 rounded-t-md text-l"><Plus/>Create</Link>
                        </div>
                    </div>
                    <div className="relative group">
                        <Link href="/timelines" className="flex gap-2 p-2 text-xl text-white hover:bg-gray-700 rounded-md"><SquareGanttChart />Timelines</Link>
                        <div className="absolute left-0 hidden group-hover:block flex flex-col text-white z-10 bg-sky-600 w-full">
                            <Link href="/timelines/create" className="flex px-4 py-2 hover:bg-gray-700 rounded-t-md text-l"><Plus/>Create</Link>
                        </div>
                    </div>
                    <div className="relative group">
                        <Link href="/playlists" className="flex gap-2 p-2 text-xl text-white hover:bg-gray-700 rounded-md"><ListVideo />Playlists</Link>
                        <div className="absolute left-0 hidden group-hover:block flex flex-col text-white z-10 bg-sky-600 w-full">
                            <Link href="/playlists/create" className="flex px-4 py-2 hover:bg-gray-700 rounded-t-md text-l"><Plus/>Create</Link>
                        </div>
                    </div>
                    <div className="relative group">
                        <Link href="/videos" className="flex gap-2 p-2 text-xl text-white hover:bg-gray-700 rounded-md"><Youtube />Vidéos</Link>
                        <div
                            className="absolute left-0 hidden group-hover:block flex flex-col text-white z-10 bg-sky-600 w-full">
                            <Link href="/videos/create" className="flex px-4 py-2 hover:bg-gray-700 rounded-t-md text-l"><Plus/>Create</Link>
                        </div>
                    </div>
                    <LogoutForm/>
                </>
            ) : (
                <Link href="/login" className="flex text-xl p-2 text-white hover:bg-gray-700 rounded-md"><LogIn /> Login</Link>
            )}
        </nav>
    );
}
