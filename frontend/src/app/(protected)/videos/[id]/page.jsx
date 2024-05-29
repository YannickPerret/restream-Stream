'use client'

import {useVideoStore} from "#stores/useVideoStore";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import VideosShowView from "@/views/videos/show";
import StreamsEditView from "@/views/streams/edit.jsx";
import VideosEditView from "@/views/videos/edit.jsx";

export default function VideoShowPage() {
    const getVideo = useVideoStore.use.fetchVideoById();
    const {id} = useParams()
    const [selectedVideo, setSelectedVideo] = useState(null);
    const video = useVideoStore.use.selectedVideo();


    useEffect(() => {
        const fetchVideo = async () => {
            await getVideo(id)
        }
        fetchVideo()
    }, [id]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            {selectedVideo && (
                <VideosEditView
                    videoToEdit={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Show video Information</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/videos"} className={"flex"}><ArrowLeft/>&nbsp; Back to Videos</Link>
                    </div>
                    <div>
                        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => setSelectedVideo(video)}>Edit
                        </button>
                    </div>
                </header>

                <VideosShowView/>
            </div>
        </section>
    )
}