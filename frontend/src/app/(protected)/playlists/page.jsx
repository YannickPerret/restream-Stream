'use client';

import { useEffect } from "react";
import { usePlaylistStore } from "#stores/usePlaylistStore";
import PlaylistIndexView from "@/views/playlists";
import Link from "next/link";

export default function PlaylistIndexPage() {
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists();

    useEffect(() => {
        const getPlaylists = async () => {
            await fetchPlaylists();
        };
        getPlaylists();
    }, [fetchPlaylists]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl p-8 bg-gradient-to-r from-indigo-900 via-gray-900 to-black">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Your Playlists</h1>
                    <Link href="/playlists/new">
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Add New Playlist
                        </button>
                    </Link>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6" />
                <PlaylistIndexView />
            </div>
        </section>
    );
}
