import React from 'react';

const TimelineControlPanel = ({ videos = [], addVideo, setAddAutoTransition, setVideoTransition }) => {
    return (
        <div className="flex flex-row mt-4 px-24">
            <label className="flex-1 text-white flex items-center space-x-2">
                <input
                    type="checkbox"
                    onChange={(e) => setAddAutoTransition(e.target.checked)}
                    className="form-checkbox"
                />
                <span>Add auto transition</span>
            </label>
            <select
                onChange={(e) => setVideoTransition(e.target.value)}
                className="flex-1 mt-2 bg-gray-800 text-white py-2 px-4 rounded-lg w-full"
            >
                <option value="">Select transition video</option>
                {videos.map(video => (
                    <option key={video.id} value={video.id}>
                        {video.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TimelineControlPanel;
