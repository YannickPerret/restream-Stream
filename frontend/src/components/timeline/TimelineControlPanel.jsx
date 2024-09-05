import React, { useState } from 'react';

const TimelineControlPanel = ({ videos = [], setAddAutoTransition, setVideoTransition, createPlaylist }) => {
    const [playlistName, setPlaylistName] = useState('');

    const handleCreatePlaylist = () => {
        if (playlistName.trim()) {
            createPlaylist(playlistName.trim());
            setPlaylistName(''); // Réinitialiser le champ après la création
        } else {
            alert('Please enter a valid playlist name.');
        }
    };

    return (
        <div className="flex flex-col mt-4 px-24">
            <div className="flex flex-row mb-4">
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

            <div className="flex flex-row items-center space-x-4">
                <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Enter playlist name"
                    className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg"
                />
                <button
                    onClick={handleCreatePlaylist}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                    Create Playlist
                </button>
            </div>
        </div>
    );
};

export default TimelineControlPanel;
