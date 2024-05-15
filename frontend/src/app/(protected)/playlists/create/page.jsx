'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import PlaylistForm from "#components/forms/playlist";
import { PlaylistApi } from "#api/playlist";
import { useVideoStore } from "#stores/useVideoStore";
import { VideoApi } from "#api/video";
import DraggableList from '#components/draggable/Draggable';

export default function PlaylistCreatePage() {
    const [playlist, setPlaylist] = useState({
        title: '',
        description: '',
        isPublished: true,
        items: []
    });
    const videos = useVideoStore.use.videos();

    useEffect(() => {
        const fetchVideos = async () => {
            const data = await VideoApi.getAll();
            useVideoStore.setState({ videos: data });
        };
        fetchVideos();
    }, []);

    useEffect(() => {
        const savedPlaylist = localStorage.getItem('playlist');
        if (savedPlaylist) {
            setPlaylist(JSON.parse(savedPlaylist));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('playlist', JSON.stringify(playlist));
    }, [playlist]);

    const addVideoToPlaylist = (video) => {
        setPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            items: [...prevPlaylist.items, { type: 'video', video: video, key: `${video.id}-${prevPlaylist.items.length}` }]
        }));
    };

    const removeItemFromPlaylist = (key) => {
        setPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            items: prevPlaylist.items.filter((item) => item.key !== key)
        }));
    };

    const submitPlaylist = async (title, description, isPublished) => {
        const newPlaylist = { ...playlist, title, description, isPublished };
        await PlaylistApi.create(newPlaylist).then((response) => {
            if (response.ok) {
                console.log('Playlist created successfully');
                setPlaylist({ title: '', description: '', isPublished: true, items: [] });
                localStorage.removeItem('playlist');
            }
        });
    };

    const totalDuration = playlist.items.reduce((acc, item) => acc + item.video.duration, 0);

    const onListChange = (newList) => {
        setPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            items: newList
        }));
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4 ">Create a new stream</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />
                    <div>
                        <Link href={"/playlists"}>Back to Playlists</Link>
                    </div>
                </div>

                <div className="flex flex-row">
                    <aside>
                        <PlaylistForm
                            title={playlist.title}
                            isPublished={playlist.isPublished}
                            setPublished={(value) => setPlaylist((prevPlaylist) => ({ ...prevPlaylist, isPublished: value }))}
                            setTitle={(title) => setPlaylist((prevPlaylist) => ({ ...prevPlaylist, title }))}
                            description={playlist.description}
                            setDescription={(value) => setPlaylist((prevPlaylist) => ({ ...prevPlaylist, description: value }))}
                            submitPlaylist={submitPlaylist}
                        />

                        <h2>Add Videos to Playlist</h2>

                        {videos?.length === 0 && <p>No video available</p>}
                        {videos?.map((video, index) => (
                            <div key={index} className="flex gap-2">
                                <p>{video.title}</p>
                                <p>Durée : {video.duration} s</p>
                                <button onClick={() => addVideoToPlaylist(video)}>Add to Playlist</button>
                            </div>
                        ))}
                    </aside>

                    <div className="rows">
                        <h2>Current Playlist</h2>
                        <div>
                            <p>Durée totale de la playlist : {totalDuration} s</p>
                        </div>
                        <DraggableList
                            items={playlist.items}
                            onListChange={onListChange}
                            remove={removeItemFromPlaylist}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
