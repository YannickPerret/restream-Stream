'use client';
import { useState } from "react";
import { useVideoStore } from "#stores/useVideoStore";
import Link from "next/link";
import { getDurationInFormat } from "#helpers/time.js";
import { boolenStringFormat } from "#helpers/string.js";
import VideosEditView from "@/views/videos/edit.jsx";
import Table from "#components/table/Table.jsx";
import videoFormatage from "#libs/VideoFormatage.js";

export default function VideoIndexView() {
    const videos = useVideoStore.use.videos();
    const removeVideo = useVideoStore.use.deleteVideoById();
    const [selectedVideo, setSelectedVideo] = useState(null);

    const handleRemoveVideo = async (id) => {
        await removeVideo(id);
    };

    const columns = [
        { title: "Title", dataIndex: "title", key: "title", render: (text, video) => <Link href={`/videos/${video.id}`}>{text}</Link> },
        { title: "Description", dataIndex: "description", key: "description", render: (description) => description.substring(0, 255) || "No description" },
        { title: "Duration", dataIndex: "duration", key: "duration", render: (duration) => getDurationInFormat(duration) },
        { title: "Status", dataIndex: "status", key: "status" },
        { title: "Show in live?", dataIndex: "showInLive", key: "showInLive", render: (value) => boolenStringFormat(value) },
        { title: "Size", dataIndex: "size", key: "size", render: (size) => videoFormatage.formatSize(size) },
        {
            title: "Actions",
            key: "actions",
            render: (text, video) => (
                <div className="flex space-x-4">
                    <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setSelectedVideo(video)}>Edit
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleRemoveVideo(video.id)}>Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="relative overflow-hidden rounded-lg">
            {selectedVideo && (
                <VideosEditView videoToEdit={selectedVideo} onClose={() => setSelectedVideo(null)} />
            )}
            <Table data={videos} columns={columns} />
        </div>
    );
}
