'use client';
import VideoCreateForm from "@/components/forms/video";
import VideoPreview from "@/components/videos/preview";
import {useState} from "react";

export default function VideoCreatePage() {
    const [videoFile, setVideoFile] = useState('');
    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4 ">Create a new video</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </div>

                <div>
                    {videoFile.length > 0 && (
                        <VideoPreview videoUrl={videoFile}/>
                    )}
                    <VideoCreateForm setVideoFile={setVideoFile}/>
                </div>
            </div>
        </section>
    )
}