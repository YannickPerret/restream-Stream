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
            await new Promise(resolve => setTimeout(resolve, 100));
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
            <Link href="/" className=" flex items-center p-2 text-white hover:bg-gray-700 rounded-md">
                <span>Home</span>
            </Link>
            {isAuthenticated() ? (
                <>
                    <div className="relative group">
                        <Link href="/streams" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md">
                            <span>Streams</span>
                        </Link>
                        <div className="absolute left-0 hidden group-hover:block flex flex-col mt-1 text-white z-10">
                            <Link href="/streams/create" className="px-4 py-2 hover:bg-gray-700 rounded-t-md">Create</Link>
                            <Link href="/streams/2" className="px-4 py-2 hover:bg-gray-700">Stream 2</Link>
                            <Link href="/streams/3" className="px-4 py-2 hover:bg-gray-700 rounded-b-md">Stream 3</Link>
                        </div>
                    </div>
                    <div className="relative group">
                        <Link href="/providers"
                              className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md">
                            <span>Providers</span>
                        </Link>
                        <div className="absolute left-0 hidden flex flex-col mt-1 text-white z-10">
                            <Link href="/providers/create" className="px-4 py-2 hover:bg-gray-700 rounded-t-md">Create</Link>
                        </div>
                    </div>
                        <Link href="/timelines"
                              className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md">
                            <span>Timelines</span>
                        </Link>
                        <div className="relative group">
                            <Link href="/playlists"
                                  className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md">
                                <span>Playlists</span>
                            </Link>
                            <div className="absolute left-0 hidden flex flex-col mt-1 text-white z-10">
                                <Link href="/playlists/1"
                                      className="px-4 py-2 hover:bg-gray-700 rounded-t-md">Create</Link>
                                <Link href="/playlists/2" className="px-4 py-2 hover:bg-gray-700">Playlist 2</Link>
                                <Link href="/playlists/3" className="px-4 py-2 hover:bg-gray-700 rounded-b-md">Playlist
                                    3</Link>
                            </div>
                        </div>
                        <Link href="/videos" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md">
                            <span>Vidéos</span>
                        </Link>
                        <LogoutForm/>
                    </>
                    ) : (
                    <Link href="/login" className="flex items-center p-2 text-white hover:bg-gray-700 rounded-md">
                        <span>Login</span>
                    </Link>
                    )}
                </nav>
            );
            }
