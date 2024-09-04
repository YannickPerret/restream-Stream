import React from 'react';
import TimelineVideoItem from './TimelineVideoItem';
import { useVideoStore } from '#stores/useVideoStore';

const TimelineVideoList = ({ onAdd }) => {
    const videos = useVideoStore.use.videos();

    return (
        <div className="timeline-video-list">
            {videos.map(video => (
                <TimelineVideoItem
                    key={video.id}
                    video={video}
                    onAdd={onAdd}
                />
            ))}
        </div>
    );
};

export default TimelineVideoList;
