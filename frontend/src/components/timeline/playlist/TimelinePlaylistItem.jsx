import React from 'react';

const TimelinePlaylistItem = ({ playlist, onAdd }) => {
    return (
        <div className="p-4 bg-gray-800 rounded-lg flex justify-between items-center mb-4">
            <div className="text-white">
                <h4 className="text-lg font-semibold">{playlist.title}</h4>
                <p className="text-sm text-gray-400">Videos: {playlist.videos.length}</p>
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
