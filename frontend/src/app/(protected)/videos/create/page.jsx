'use client';
import VideoCreateForm from "@/components/forms/video";
import VideoPreview from "@/components/videos/preview";
import {useState} from "react";

export default function VideoCreatePage() {
    const [videoFile, setVideoFile] = useState('');
    return (
        <section>
            <header>
                <h1>Video Create Page</h1>
            </header>

            <div>
                {videoFile.length > 0 && (
                    <VideoPreview videoUrl={videoFile}/>
                )}
                <VideoCreateForm setVideoFile={setVideoFile}/>
            </div>
        </section>
    )
}