'use client'

import PlaylistIndexView from "@/views/playlists/index.js";
import {useEffect} from "react";
import {usePlaylistStore} from "#stores/usePlaylistStore";


export default function PlaylistIndexPage() {
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists()

    useEffect(() => {
        const getPlaylists = async () => {
            await fetchPlaylists();
        }
        getPlaylists();
    }, []);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Your playlists</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </header>

                <PlaylistIndexView/>
            </div>
        </section>
    )
}