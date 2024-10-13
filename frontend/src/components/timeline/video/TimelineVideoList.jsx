import React, { useState } from 'react';
import TimelineVideoItem from './TimelineVideoItem';
import { useVideoStore } from '#stores/useVideoStore';
import Input from "#components/_forms/Input.jsx";
import { DateTime } from "luxon";
import { useTimelineStore } from "#stores/useTimelineStore.js";

const TimelineVideoList = () => {
    const { videos } = useVideoStore();
    const [searchTerm, setSearchTerm] = useState('');
    const { addNewVideoInTimeline } = useTimelineStore();

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = (video) => {
        const currentDate = DateTime.now();
        const newVideoItem = {
            id: video.id,
            type: 'video',
            title: video.title,
            duration: video.duration,
        };

        // Ajout de la vidéo dans `newTimeline`
        addNewVideoInTimeline(newVideoItem);
    };

    return (
        <div
            className="flex flex-col gap-4 overflow-y-auto p-4 bg-gray-800 rounded-lg "
            style={{ maxHeight: '900px' }}
        >
            <Input
                placeholder="Search videos by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredVideos.map(video => (
                <TimelineVideoItem
                    key={video.id}
                    video={video}
                    onAdd={() => handleAdd(video)}
                />
            ))}
        </div>
    );
};

export default TimelineVideoList;
