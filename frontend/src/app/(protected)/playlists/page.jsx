'use client'
import {usePlaylistStore} from "#stores/usePlaylistStore";
import {PlaylistApi} from "#api/playlist";
import PlaylistIndexView from "@/views/playlists/index.js";
import {useEffect} from "react";

export default function PlaylistIndexPage() {

    useEffect(() => {
        const fetchPlaylists = async () => {
            await PlaylistApi.getAll().then((data) => {
                usePlaylistStore.setState({
                    playlists: data
                })
            })
        }
        fetchPlaylists();
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