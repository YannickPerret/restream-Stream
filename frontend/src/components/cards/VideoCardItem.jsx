import React from 'react';
import CardItem from './CardItem';

const VideoCardItem = ({ video, number, draggable, remove, add, addable }) => {
    if (!video) return null;
    return (
        <CardItem
            title={video.title || 'Unknown Video'}
            number={number}
            draggable={draggable}
            remove={remove}
            add={add}
            addable={addable}
        >
            <p className="text-gray-500 dark:text-gray-400">{video.description}</p>
            {video.duration && <p className="text-sm text-gray-400 dark:text-gray-500">Duration: {`${Math.floor(video.duration / 60)}m ${video.duration % 60}s`}</p>}
        </CardItem>
    );
};

export default VideoCardItem;