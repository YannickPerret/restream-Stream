'use client';
import {useVideoStore} from "#stores/useVideoStore";
import Link from "next/link";
import {VideoApi} from "#api/video.js";
import {getDurationInFormat} from "#helpers/time.js";
import {boolenStringFormat} from "#helpers/string.js";
import ProvidersEditView from "@/views/providers/edit.jsx";
import VideoEditForm from "#components/forms/edit/video.jsx";
import VideosEditView from "@/views/videos/edit.jsx";
import {useState} from "react";

export default function VideoIndexView() {
    const videos = useVideoStore.use.videos();
    const removeVideo = useVideoStore.use.deleteVideoById();
    const [selectedVideo, setSelectedVideo] = useState(null);


    const handleRemoveVideo = async (id) => {
        await removeVideo(id);
    }

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {selectedVideo && (
                <VideosEditView videoToEdit={selectedVideo} onClose={() => setSelectedVideo(null)}/>
            )}
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" >
                <tr>
                    <th scope="col" className="px-6 py-3">Title</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3">Duration</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Show in live?</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                {videos.map((video) => (
                    <tr key={video.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"><Link href={`/videos/${video.id}`}>{video.title}</Link></th>
                        <td>{video.description}</td>
                        <td>{getDurationInFormat(video.duration)}</td>
                        <td>{video.status}</td>
                        <td>{boolenStringFormat(video.showInLive)}</td>
                        <td>
                            <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => setSelectedVideo(video)}>Edit
                            </button>
                            <button className="btn btn-error" onClick={() => handleRemoveVideo(video.id)}>Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}