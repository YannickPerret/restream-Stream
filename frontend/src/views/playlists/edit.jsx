import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import { useVideoStore } from '#stores/useVideoStore';
import CardList from '#components/cards/CardList';

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
    }
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

    const mapItemsToCards = (items, isPlaylist = false, draggable = false, addable = false) =>
        items.map((item, index) => ({
            id: `${item.id}-${isPlaylist ? 'playlist' : 'available'}-${index}`,
            item,
            number: isPlaylist ? index + 1 : null,
            remove: () => handleRemoveItem(index),
            add: () => handleAddItem(item),
            draggable: draggable,
            addable: addable
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
            <div className="grid grid-cols-5 gap-8">
                <div className="col-span-2">
                    <CardList
                        title="List of videos available"
                        items={mapItemsToCards(videos, false, false, true)}
                        draggable={false}
                    />
                </div>
                <div className="col-span-3">
                    <CardList
                        title="Current playlist"
                        items={mapItemsToCards(localPlaylist, true, true, false)}
                        draggable={true}
                        onListChange={handleListChange}
                    />
                </div>
                <button
                    className="col-span-5 bg-blue-500 text-white py-2 px-4 rounded mt-4"
                    onClick={savePlaylist}
                >
                    Save Playlist
                </button>
            </div>
        </>
    )
}