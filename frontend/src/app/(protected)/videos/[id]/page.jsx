'use client'

import {useVideoStore} from "#stores/useVideoStore";
import {useEffect} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import VideosShowView from "@/views/videos/show";

export default function VideoShowPage() {
    const getVideo = useVideoStore.use.fetchVideoById();
    const {id} = useParams()

    useEffect(() => {
        const fetchVideo = async () => {
            await getVideo(id)
        }

        fetchVideo()
    }, [id]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Show video Information</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/videos"} className={"flex"}><ArrowLeft />&nbsp; Back to Videos</Link>
                    </div>
                </header>

                <VideosShowView />
            </div>
        </section>
    )
}