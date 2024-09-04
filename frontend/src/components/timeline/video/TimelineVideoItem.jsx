import React from 'react';

const TimelineVideoItem = ({ video, onAdd }) => {
    return (
        <div className="p-4 bg-gray-800 rounded-lg flex justify-between items-center mb-4">
            <div className="text-white">
                <h4 className="text-lg font-semibold">{video.title}</h4>
                <p className="text-sm text-gray-400">Duration: {video.duration} minutes</p>
            </div>
            <button
                onClick={() => onAdd(video)}
                className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-4 rounded-lg"
            >
                Add to Timeline
            </button>
        </div>
    );
};

export default TimelineVideoItem;
