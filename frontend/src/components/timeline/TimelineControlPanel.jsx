import React, { useState } from 'react';
import {useTimelineStore} from "#stores/useTimelineStore.js";

const TimelineControlPanel = ({ createPlaylist }) => {
    const { newTimeline, setNewTimeline } = useTimelineStore()

    const handleCreatePlaylist = () => {
        if (playlistName.trim()) {

            createPlaylist(playlistName.trim());

        } else {
            alert('Please enter a valid playlist name.');
        }
    };

    return (
        <div className="flex flex-row mb-4">
            <input
                type="text"
                value={newTimeline.title}
                onChange={(e) => setNewTimeline('title', e.target.value)}
                placeholder="Enter playlist name"
                className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg"
                required={true}
            />
            <button
                onClick={handleCreatePlaylist}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                Create Playlist
            </button>
        </div>
    );
};

export default TimelineControlPanel;
