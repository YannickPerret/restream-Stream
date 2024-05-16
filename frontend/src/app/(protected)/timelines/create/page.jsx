'use client'
import TimelineForm from "#components/forms/create/timeline.js";
import Link from "next/link";
import { useState } from "react";
import { useVideoStore } from "#stores/useVideoStore.js";
import { usePlaylistStore } from "#stores/usePlaylistStore.js";
import { TimelineApi } from "#api/timeline.js";
import DraggableList from '#components/draggable/Draggable';

export default function TimelineCreatePage() {
    const [timeline, setTimeline] = useState({
        title: "",
        description: "",
        isPublished: true,
        items: []
    });

    const videos = useVideoStore.use.videos();
    const playlists = usePlaylistStore.use.playlists();

    const submitTimeline = async (title, description, isPublished) => {
        const newTimeline = { ...timeline, title, description, isPublished };
        const itemsForBackend = timeline.items.map((item, index) => ({
            type: item.type,
            itemId: item.type === 'video' ? item.video.id : item.playlist.id,
            order: index
        }));

        await TimelineApi.create({ ...newTimeline, items: itemsForBackend }).then((response) => {
            if (response.ok) {
                console.log('Timeline created successfully');
                setTimeline({ title: '', description: '', isPublished: true, items: [] });
                localStorage.removeItem('timeline');
            }
        });
    };

    const addVideoToTimeline = (video) => {
        setTimeline((prevTimeline) => ({
            ...prevTimeline,
            items: [
                ...prevTimeline.items,
                {
                    type: "video",
                    video: video,
                    key: `video-${video.id}-${prevTimeline.items.length}`
                }
            ]
        }));
    };

    const addPlaylistToTimeline = (playlist) => {
        setTimeline((prevTimeline) => ({
            ...prevTimeline,
            items: [
                ...prevTimeline.items,
                {
                    type: "playlist",
                    playlist: playlist,
                    key: `playlist-${playlist.id}-${prevTimeline.items.length}`
                }
            ]
        }));
    };

    const removeItemFromTimeline = (key) => {
        setTimeline((prevTimeline) => ({
            ...prevTimeline,
            items: prevTimeline.items.filter((item) => item.key !== key)
        }));
    };

    const onListChange = (newList) => {
        setTimeline((prevTimeline) => ({
            ...prevTimeline,
            items: newList
        }));
    };

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
                    <aside>
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

                        <h2>Add Videos to Timeline</h2>

                        {videos?.length === 0 && <p>No video available</p>}
                        {videos?.map((video, index) => (
                            <div key={index} className="flex gap-2">
                                <p>{video.title}</p>
                                <p>Durée : {video.duration} s</p>
                                <button onClick={() => addVideoToTimeline(video)}>Add to Timeline</button>
                            </div>
                        ))}

                        <h2>Add Playlist to Timeline</h2>
                        {playlists?.length === 0 && <p>No playlist available</p>}
                        {playlists?.map((playlist, index) => (
                            <div key={index} className="flex gap-2">
                                <p>{playlist.title}</p>
                                <p>Durée : {playlist.duration} s</p>
                                <button onClick={() => addPlaylistToTimeline(playlist)}>Add to Timeline</button>
                            </div>
                        ))}
                    </aside>

                    <div className="rows">
                        <h2>Current Timeline</h2>
                        <DraggableList
                            items={timeline.items}
                            onListChange={onListChange}
                            remove={removeItemFromTimeline}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
