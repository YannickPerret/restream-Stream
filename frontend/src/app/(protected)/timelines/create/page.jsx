'use client'
import TimelineForm from "#components/forms/create/timeline.js";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useVideoStore } from "#stores/useVideoStore.js";
import { usePlaylistStore } from "#stores/usePlaylistStore.js";
import { TimelineApi } from "#api/timeline.js";
import VideoCardItem from "#components/cards/VideoCardItem.jsx";
import PlaylistCardItem from "#components/cards/PlaylistCardItem.jsx";
import SimpleCardList from "#components/cards/SimpleCardList.jsx";
import CardList from "#components/cards/CardList";
import { getDurationInFormat } from "#helpers/time.js";

export default function TimelineCreatePage() {
    const [timeline, setTimeline] = useState({
        title: "",
        description: "",
        isPublished: true,
        items: []
    });

    const [addAutoTransitionAfter, setAddAutoTransitionAfter] = useState(false);
    const [videoTransition, setVideoTransition] = useState("");

    const fetchVideos = useVideoStore.use.fetchVideos();
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists();
    const videos = useVideoStore.use.videos();
    const playlists = usePlaylistStore.use.playlists();

    useEffect(() => {
        fetchVideos();
        fetchPlaylists();
    }, [fetchVideos, fetchPlaylists]);

    const submitTimeline = async (title, description, isPublished) => {
        const newTimeline = { ...timeline, title, description, isPublished };
        const itemsForBackend = timeline.items.map((item, index) => ({
            type: item.type,
            itemId: item.type === 'video' ? item.video.id : item.playlist.id,
            order: index
        }));

        const response = await TimelineApi.create({ ...newTimeline, items: itemsForBackend });
        if (response.ok) {
            console.log('Timeline created successfully');
            setTimeline({ title: '', description: '', isPublished: true, items: [] });
            localStorage.removeItem('timeline');
        }
    };

    const addVideoToTimeline = (video) => {
        const newItems = [
            ...timeline.items,
            {
                type: "video",
                video: video,
                key: `video-${video.id}-${Date.now()}`
            }
        ];
        if (addAutoTransitionAfter && videoTransition) {
            const transitionVideo = videos.find(v => v.id === parseInt(videoTransition));
            if (transitionVideo) {
                newItems.push({
                    type: "video",
                    video: transitionVideo,
                    key: `transition-${transitionVideo.id}-${Date.now()}`
                });
            }
        }
        setTimeline((prevTimeline) => ({
            ...prevTimeline,
            items: newItems
        }));
    };

    const addPlaylistToTimeline = (playlist) => {
        const newItems = [
            ...timeline.items,
            {
                type: "playlist",
                playlist: playlist,
                key: `playlist-${playlist.id}-${Date.now()}`
            }
        ];
        if (addAutoTransitionAfter && videoTransition) {
            const transitionVideo = videos.find(v => v.id === parseInt(videoTransition));
            if (transitionVideo) {
                newItems.push({
                    type: "video",
                    video: transitionVideo,
                    key: `transition-${transitionVideo.id}-${Date.now()}`
                });
            }
        }
        setTimeline((prevTimeline) => ({
            ...prevTimeline,
            items: newItems
        }));
    };

    const removeItemFromTimeline = (key) => {
        setTimeline((prevTimeline) => ({
            ...prevTimeline,
            items: prevTimeline.items.filter((item) => item.key !== key)
        }));
    };

    const onListChange = (newList) => {
        const updatedItems = newList.map((item, index) => ({
            ...item,
            order: index,
        }));
        setTimeline((prevTimeline) => ({
            ...prevTimeline,
            items: updatedItems
        }));
    };

    const videoItems = videos.map(video => ({
        id: `video-${video.id}`,
        content: (
            <VideoCardItem
                key={`video-${video.id}`}
                video={video}
                addable
                add={() => addVideoToTimeline(video)}
            />
        )
    }));

    const playlistItems = playlists.map(playlist => ({
        id: `playlist-${playlist.id}`,
        content: (
            <PlaylistCardItem
                key={`playlist-${playlist.id}`}
                playlist={playlist}
                addable
                add={() => addPlaylistToTimeline(playlist)}
            />
        )
    }));

    const timelineItems = timeline.items.map((item, index) => ({
        id: item.key,
        key: item.key,
        content: (
            item.type === 'video' ? (
                <VideoCardItem
                    key={item.key}
                    video={item.video}
                    number={index + 1}
                    draggable
                    remove={() => removeItemFromTimeline(item.key)}
                />
            ) : (
                <PlaylistCardItem
                    key={item.key}
                    playlist={item.playlist}
                    number={index + 1}
                    draggable
                    remove={() => removeItemFromTimeline(item.key)}
                />
            )
        )
    }));

    const calculateTotalDuration = () => {
        return timeline.items.reduce((total, item) => {
            if (item.type === 'video') {
                return total + (item.video.duration || 0);
            } else if (item.type === 'playlist') {
                return total + item.playlist.videos.reduce((playlistTotal, video) => {
                    return playlistTotal + (video.duration || 0);
                }, 0);
            }
            return total;
        }, 0);
    };

    const totalDuration = calculateTotalDuration();

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Create a new timeline</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/timelines"}>Back to Timelines</Link>
                    </div>
                </header>

                <div className="flex flex-row">
                    <aside className="w-1/3 p-4 space-y-8">
                        <TimelineForm
                            title={timeline.title}
                            isPublished={timeline.isPublished}
                            setPublished={(value) => setTimeline((prevTimeline) => ({
                                ...prevTimeline,
                                isPublished: value
                            }))}
                            setTitle={(title) => setTimeline((prevTimeline) => ({...prevTimeline, title}))}
                            description={timeline.description}
                            setDescription={(value) => setTimeline((prevTimeline) => ({
                                ...prevTimeline,
                                description: value
                            }))}
                            submitTimeline={submitTimeline}
                        />
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
                                {videos.filter(video => !video.showInLive).map(video => (
                                    <option key={video.id} value={video.id}>{video.title}</option>
                                ))}
                            </select>
                        </div>
                        <SimpleCardList
                            title="List of videos available"
                            items={videoItems}
                            className="overflow-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                        />
                        <SimpleCardList
                            title="List of playlists available"
                            items={playlistItems}
                            className="overflow-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                        />
                    </aside>

                    <div className="w-2/3 p-4">
                        <h2>Current Timeline</h2>
                        <p>Total Duration: {getDurationInFormat(totalDuration)}</p>

                        <CardList
                            title=""
                            items={timelineItems}
                            onListChange={onListChange}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
