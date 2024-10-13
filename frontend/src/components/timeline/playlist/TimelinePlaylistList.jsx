import React, { useState, useEffect } from 'react';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import TimelinePlaylistItem from './TimelinePlaylistItem';
import Input from "#components/_forms/Input.jsx";
import { useTimelineStore } from "#stores/useTimelineStore.js";

const TimelinePlaylistList = () => {
    const { playlists, fetchPlaylists } = usePlaylistStore();
    const [searchTerm, setSearchTerm] = useState('');
    const { addNewVideoInTimeline } = useTimelineStore();

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    const handleAdd = (playlist) => {
        const playlistItem = {
            id: playlist.id,
            type: 'playlist',
            title: playlist.title,
            videos: [],
            duration: 0,
        };

        let playlistDuration = 0

        playlist.videos.forEach((video) => {
            const videoDuration = video.duration;

            playlistDuration += videoDuration;

            playlistItem.videos.push({
                id: video.id,
                type: 'video',
                title: video.title,
                duration: videoDuration,
            });

        });
        playlistItem.duration = playlistDuration;

        addNewVideoInTimeline(playlistItem);
    }

    const filteredPlaylists = playlists.filter(playlist =>
        playlist.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '900px' }}>
            <Input
                placeholder="Search playlists by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredPlaylists.map(playlist => (
                <TimelinePlaylistItem
                    key={playlist.id}
                    playlist={playlist}
                    onAdd={handleAdd}
                />
            ))}
        </div>
    );
};

export default TimelinePlaylistList;
