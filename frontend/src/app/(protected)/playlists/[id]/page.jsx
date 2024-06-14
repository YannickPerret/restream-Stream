'use client'
import {useParams} from "next/navigation";
import {usePlaylistStore} from "#stores/usePlaylistStore";
import {useEffect} from "react";
import PlaylistShowView from "@/views/playlists/show.jsx";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";

export default function PlaylistShowPage() {

    const getPlaylist = usePlaylistStore.use.fetchPlaylistById()
    const { id } = useParams();


    useEffect(() => {
        const fetchPlaylist = async() => {
            if(id) {
                await getPlaylist(id)
            }
        }
        fetchPlaylist();
    }, [id]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Show Playlist Information</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/playlists"} className={"flex"}><ArrowLeft />&nbsp; Back to Playlists</Link>
                    </div>
                </header>


                <PlaylistShowView/>
            </div>
        </section>
    )
}