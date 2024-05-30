'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTimelineStore } from '#stores/useTimelineStore';
import { useVideoStore } from '#stores/useVideoStore';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import CardList from '#components/cards/CardList';
import SimpleCardList from "#components/cards/SimpleCardList.jsx";
import VideoCardItem from "#components/cards/VideoCardItem";
import PlaylistCardItem from "#components/cards/PlaylistCardItem";

export default function TimelinesEditView() {
    const { id } = useParams();
    const fetchTimelineById = useTimelineStore.use.fetchTimelineById();
    const fetchVideos = useVideoStore.use.fetchVideos();
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists();
    const selectedTimeline = useTimelineStore.use.selectedTimeline();
    const videos = useVideoStore.use.videos();
    const playlists = usePlaylistStore.use.playlists();
    const updateTimeline = useTimelineStore.use.updateTimelineById();
    const [addAutoTransitionAfter, setAddAutoTransitionAfter] = useState(false);
    const [videoTransition, setVideoTransition] = useState("");
    const videosNotShownLive = videos.filter(video => !video.showInLive);
    const [localTimeline, setLocalTimeline] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await fetchVideos();
            await fetchPlaylists();
            await fetchTimelineById(id);
        };
        fetchData();
    }, [id, fetchVideos, fetchPlaylists, fetchTimelineById]);

    useEffect(() => {
        if (selectedTimeline) {
            const timelineItems = selectedTimeline.items.map(item => {
                if (item.type === 'video') {
                    const video = videos.find(v => v.id === item.itemId);
                    return video ? { ...item, video } : null;
                } else if (item.type === 'playlist') {
                    const playlist = playlists.find(p => p.id === item.itemId);
                    return playlist ? { ...item, playlist } : null;
                }
                return item;
            }).filter(item => item !== null);
            setLocalTimeline(timelineItems);
        }
    }, [selectedTimeline, videos, playlists]);

    if (!selectedTimeline || !videos || !playlists) {
        return <div>Loading...</div>;
    }

    const handleListChange = (reorderedItems) => {
        const updatedTimeline = reorderedItems.map(item => item.item);
        console.log('Updated Timeline after Drag:', updatedTimeline);
        setLocalTimeline(updatedTimeline);
    };

    const handleRemoveItem = (index) => {
        const updatedTimeline = [...localTimeline];
        updatedTimeline.splice(index, 1);
        setLocalTimeline(updatedTimeline);
    };

    const saveTimeline = async () => {
        const updatedTimeline = {
            ...selectedTimeline,
            items: localTimeline.map((item, index) => ({
                id: item.id,
                type: item.type,
                itemId: item.type === 'video' ? item.video.id : item.playlist.id,
                order: index + 1
            }))
        };
        await updateTimeline(id, updatedTimeline);
    };

    const handleAddItem = (item, type) => {
        const newItem = {
            id: item.id,
            type: type,
            itemId: item.id,
            order: localTimeline.length + 1,
            video: type === 'video' ? item : undefined,
            playlist: type === 'playlist' ? item : undefined
        };
        const newTimeline = [...localTimeline, newItem];
        if (addAutoTransitionAfter && videoTransition) {
            const transitionVideo = videos.find(v => v.id === parseInt(videoTransition));
            if (transitionVideo) {
                newTimeline.push({
                    id: transitionVideo.id,
                    type: 'video',
                    itemId: transitionVideo.id,
                    order: newTimeline.length + 1,
                    video: transitionVideo
                });
            }
        }
        setLocalTimeline(newTimeline);
    };

    const videoItems = videos.map(video => ({
        id: video.id,
        content: (
            <VideoCardItem
                video={video}
                addable
                add={() => handleAddItem(video, 'video')}
            />
        )
    }));

    const playlistItems = playlists.map(playlist => ({
        id: playlist.id,
        content: (
            <PlaylistCardItem
                playlist={playlist}
                addable
                add={() => handleAddItem(playlist, 'playlist')}
            />
        )
    }));

    const timelineItems = localTimeline.map((item, index) => {
        if (!item) {
            console.error("Invalid item in localTimeline:", item);
            return null;
        }
        return {
            id: `timeline-item-${index}`,
            item,
            content: (
                item.type === 'video' ? (
                    <VideoCardItem
                        video={item.video}
                        number={index + 1}
                        draggable
                        remove={() => handleRemoveItem(index)}
                    />
                ) : (
                    <PlaylistCardItem
                        playlist={item.playlist}
                        number={index + 1}
                        draggable
                        remove={() => handleRemoveItem(index)}
                    />
                )
            )
        };
    }).filter(Boolean);

    return (
        <>
            <div className="mb-4">
                <label className="mr-2">Add auto transition after video</label>
                <input
                    type="checkbox"
                    checked={addAutoTransitionAfter}
                    onChange={() => setAddAutoTransitionAfter(!addAutoTransitionAfter)}
                    className="mr-4"
                />
                <label className="mr-2">Video de transition</label>
                <select
                    onChange={(e) => setVideoTransition(e.target.value)}
                    value={videoTransition}
                    className="mr-4"
                >
                    <option value="">None</option>
                    {videosNotShownLive.map(video => (
                        <option key={video.id} value={video.id}>{video.title}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    <SimpleCardList
                        title="List of videos available"
                        items={videoItems}
                    />
                    <SimpleCardList
                        title="List of playlists available"
                        items={playlistItems}
                    />
                </div>
                <div className="md:col-span-2">
                    <CardList
                        title="Current timeline"
                        items={timelineItems}
                        onListChange={handleListChange}
                    />
                </div>
                <button
                    className="col-span-1 md:col-span-3 bg-blue-500 text-white py-2 px-4 rounded mt-4"
                    onClick={saveTimeline}
                >
                    Save Timeline
                </button>
            </div>
        </>
    );
}
