'use client'
import VideoIndexView from "@/views/videos";
import {useEffect} from "react";
import {useVideoStore} from "#stores/useVideoStore";

export default function VideosIndexPage() {
    const getVideos = useVideoStore.use.fetchVideos()

    useEffect(() => {
        const fetchVideos = async () => {
            await getVideos()
        }
        fetchVideos();
    }, []);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Your videos</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </header>

                <VideoIndexView />
            </div>
        </section>
    )
}