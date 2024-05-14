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
        name: '',
        description: '',
        isPublished: true,
        videos: []
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
            videos: [...prevPlaylist.videos, { ...video, key: `${video.id}-${prevPlaylist.videos.length}` }]
        }));
    };

    const removeVideoFromPlaylist = (key) => {
        setPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            videos: prevPlaylist.videos.filter((video) => video.key !== key)
        }));
    };

    const submitPlaylist = async () => {
        await PlaylistApi.create(playlist).then((response) => {
            if (response.ok) {
                console.log('Playlist created successfully');
                setPlaylist({ name: '', description: '', isPublished: true, videos: [] });
                localStorage.removeItem('playlist');
            }
        });
    };

    const totalDuration = playlist.videos.reduce((acc, video) => acc + video.duration, 0);

    const onListChange = (newList) => {
        setPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            videos: newList
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
                            name={playlist.name}
                            isPublished={playlist.isPublished}
                            setPublished={(value) => setPlaylist((prevPlaylist) => ({ ...prevPlaylist, isPublished: value }))}
                            setName={(name) => setPlaylist((prevPlaylist) => ({ ...prevPlaylist, name }))}
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
                            items={playlist.videos}
                            onListChange={onListChange}
                            removeVideo={removeVideoFromPlaylist}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
