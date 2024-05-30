import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import { useVideoStore } from '#stores/useVideoStore';
import CardList from '#components/cards/CardList';
import SimpleCardList from "#components/cards/SimpleCardList.jsx";
import VideoCardItem from "#components/cards/VideoCardItem.jsx";

export default function PlaylistEditView() {
    const { id } = useParams();
    const fetchPlaylistById = usePlaylistStore.use.fetchPlaylistById();
    const fetchVideos = useVideoStore.use.fetchVideos();
    const selectedPlaylist = usePlaylistStore.use.selectedPlaylist();
    const videos = useVideoStore.use.videos();
    const updatePlaylist = usePlaylistStore.use.updatePlaylistById();
    const [addAutoTransitionAfter, setAddAutoTransitionAfter] = useState(false);
    const [videoTransition, setVideoTransition] = useState("");
    const videosNotShownLive = videos.filter(video => !video.showInLive);
    const [localPlaylist, setLocalPlaylist] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await fetchVideos();
            await fetchPlaylistById(id);
        };
        fetchData();
    }, [id, fetchVideos, fetchPlaylistById]);

    useEffect(() => {
        if (selectedPlaylist && selectedPlaylist.videos) {
            setLocalPlaylist(selectedPlaylist.videos);
        }
    }, [selectedPlaylist]);

    if (!selectedPlaylist || !videos) {
        return <div>Loading...</div>;
    }

    const handleListChange = (reorderedItems) => {
        const updatedPlaylist = reorderedItems.map(item => item.item);
        setLocalPlaylist(updatedPlaylist);
    };

    const handleRemoveItem = (index) => {
        const updatedPlaylist = [...localPlaylist];
        updatedPlaylist.splice(index, 1);
        setLocalPlaylist(updatedPlaylist);
    };

    const savePlaylist = async () => {
        const updatedPlaylist = {
            ...selectedPlaylist,
            videos: localPlaylist
        };
        await updatePlaylist(selectedPlaylist.id, updatedPlaylist);
    };

    const handleAddItem = (video) => {
        const newPlaylist = [...localPlaylist, video];
        if (addAutoTransitionAfter && videoTransition) {
            const transitionVideo = videos.find(v => v.id === parseInt(videoTransition));
            if (transitionVideo) {
                newPlaylist.push(transitionVideo);
            }
        }
        setLocalPlaylist(newPlaylist);
    };

    const videoItems = videos.map(video => ({
        id: video.id,
        content: (
            <VideoCardItem
                video={video}
                addable
                add={() => handleAddItem(video)}
            />
        )
    }));

    const playlistItems = localPlaylist.map((item, index) => ({
        id: `playlist-item-${index}`,
        item,
        content: (
            <VideoCardItem
                video={item}
                number={index + 1}
                draggable
                remove={() => handleRemoveItem(index)}
            />
        )
    }));

    return (
        <>
            <div>
                <label>Add auto transition after video</label>
                <input
                    type="checkbox"
                    checked={addAutoTransitionAfter}
                    onChange={() => setAddAutoTransitionAfter(!addAutoTransitionAfter)}
                />
                <label>Video de transition </label>
                <select onChange={(e) => setVideoTransition(e.target.value)} value={videoTransition}>
                    <option value="">None</option>
                    {videosNotShownLive.map(video => (
                        <option key={video.id} value={video.id}>{video.title}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-1">
                    <SimpleCardList
                        title="List of videos available"
                        items={videoItems}
                    />
                </div>
                <div className="col-span-1">
                    <CardList
                        title="Current playlist"
                        items={playlistItems}
                        onListChange={handleListChange}
                    />
                </div>
                <button
                    className="col-span-1 md:col-span-2 bg-blue-500 text-white py-2 px-4 rounded mt-4"
                    onClick={savePlaylist}
                >
                    Save Playlist
                </button>
            </div>
        </>
    );
}
