import React from 'react';
import {getDurationInFormat} from "#helpers/time.js";

const TimelinePlaylistItem = ({ playlist, onAdd }) => {


    return (
        <div className="p-4 bg-gray-700 rounded-lg flex justify-between items-center mb-4">
            <div className="text-white">
                <h4 className="text-lg font-semibold">{playlist.title || 'Untitled'}</h4>
                <p className="text-sm text-gray-400">Videos: {playlist.videos ? playlist.videos.length : 0}</p>
                <p className="text-sm text-gray-400">Duration: {getDurationInFormat(playlist.videos.map(video => video.duration).reduce((a, b) => a + b, 0))}</p>
            </div>
            <button
                onClick={() => onAdd(playlist)}
                className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-4 rounded-lg"
            >
                Add to Timeline
            </button>
        </div>
    );
};


export default TimelinePlaylistItem;
