import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import { useVideoStore } from '#stores/useVideoStore';
import CardList from '#components/cards/CardList';
import { getDurationInFormat } from '#helpers/time.js';

export default function PlaylistEditView() {
    const { id } = useParams();
    const fetchPlaylistById = usePlaylistStore.use.fetchPlaylistById();
    const fetchVideos = useVideoStore.use.fetchVideos();
    const selectedPlaylist = usePlaylistStore.use.selectedPlaylist();
    const videos = useVideoStore.use.videos();
    const updatePlaylist = usePlaylistStore.use.updatePlaylistById();

    const [localPlaylist, setLocalPlaylist] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await fetchVideos();
            await fetchPlaylistById(id);
        };
        fetchData();
    }, [id, fetchVideos, fetchPlaylistById]);

    useEffect(() => {
        if (selectedPlaylist) {
            setLocalPlaylist(selectedPlaylist.videos);
        }
    }, [selectedPlaylist]);

    if (!selectedPlaylist || !videos) {
        return <div>Loading...</div>;
    }

    const handleListChange = (reorderedIndexes) => {
        const updatedPlaylist = reorderedIndexes.map(index => localPlaylist[index]);
        setLocalPlaylist(updatedPlaylist);
    };

    const savePlaylist = async () => {
        await updatePlaylist(id, { videos: localPlaylist });
    };

    const mapVideosToItems = (videos, isPlaylist = false) =>
        videos.map((video, index) => ({
            id: index,
            videoId: video.id,
            number: isPlaylist ? index + 1 : null,
            title: video.title,
            description: video.description,
            duration: getDurationInFormat(video.duration),
            footer: video.guest ? (
                <>
                    {video.user && <span>Validate by: {video.user.fullName}</span>}<br />
                    {video.guest && <span>Upload by Guest: {video.guest.username}</span>}
                </>
            ) : (
                <span>Upload by: {video.user?.fullName}</span>
            )
        }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CardList
                title="List of videos available"
                items={mapVideosToItems(videos)}
                draggable={false}
            />
            <CardList
                title="Current playlist"
                items={mapVideosToItems(localPlaylist, true)}
                draggable={true}
                onListChange={handleListChange}
            />
            <button
                className="col-span-1 md:col-span-2 bg-blue-500 text-white py-2 px-4 rounded mt-4"
                onClick={savePlaylist}
            >
                Save Playlist
            </button>
        </div>
    );
}