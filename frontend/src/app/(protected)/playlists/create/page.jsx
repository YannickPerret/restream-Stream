'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import PlaylistForm from "#components/forms/create/playlist";
import { PlaylistApi } from "#api/playlist";
import { useVideoStore } from "#stores/useVideoStore";
import CardList from "#components/cards/CardList";
import SimpleCardList from "#components/cards/SimpleCardList.jsx";
import VideoCardItem from "#components/cards/VideoCardItem.jsx";
import { getDurationInFormat } from "#helpers/time.js";

export default function PlaylistCreatePage() {
    const [playlist, setPlaylist] = useState({
        title: '',
        description: '',
        isPublished: true,
        items: []
    });
    const [videoTransition, setVideoTransition] = useState('');
    const [addAutoTransitionAfter, setAddAutoTransitionAfter] = useState(false);
    const getVideos = useVideoStore.use.fetchVideos();
    const videos = useVideoStore.use.videos();

    useEffect(() => {
        getVideos();
    }, [getVideos]);

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
        const newPlaylist = [...playlist.items, { type: 'video', video: video, key: `${video.id}-${playlist.items.length}` }];
        if (addAutoTransitionAfter && videoTransition) {
            const transitionVideo = videos.find(v => v.id === parseInt(videoTransition));
            if (transitionVideo) {
                newPlaylist.push({ type: 'video', video: transitionVideo, key: `${transitionVideo.id}-${newPlaylist.length}` });
            }
        }
        setPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            items: newPlaylist
        }));
    };

    const removeItemFromPlaylist = (key) => {
        setPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            items: prevPlaylist.items.filter((item) => item.key !== key)
        }));
    };

    const submitPlaylist = async (title, description, isPublished) => {
        const newPlaylist = {
            title: title,
            description: description,
            isPublished: isPublished,
            items: playlist.items.map(item => ({ type: item.type, itemId: item.video.id }))
        };
        const response = await PlaylistApi.create(newPlaylist);
        if (response.ok) {
            console.log('Playlist created successfully');
            setPlaylist({ title: '', description: '', isPublished: true, items: [] });
            localStorage.removeItem('playlist');
        }
    };

    const calculateTotalDuration = () => {
        return playlist.items.reduce((total, item) => {
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

    const onListChange = (newList) => {
        setPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            items: newList
        }));
    };

    const mapItemsToCards = (items, isPlaylist = false, draggable = false, addable = false) =>
        items.map((item, index) => ({
            id: item?.id ? `${item.id}-${isPlaylist ? 'playlist' : 'available'}-${index}` : `unknown-${index}`,
            content: (
                <VideoCardItem
                    video={item.video}
                    number={isPlaylist ? index + 1 : null}
                    draggable={draggable}
                    remove={() => removeItemFromPlaylist(item.key)}
                />
            ),
            item,
            draggable: draggable,
            addable: addable
        }));

    const videoItems = videos.map(video => ({
        id: video.id,
        type: 'video',
        content: (
            <VideoCardItem
                video={video}
                addable={true}
                add={() => addVideoToPlaylist(video)}
            />
        ),
    }));

    const playlistItems = mapItemsToCards(playlist.items, true, true, false);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4 ">Create a new playlist</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />
                    <div>
                        <Link href={"/playlists"}>Back to Playlists</Link>
                    </div>
                </div>

                <div className="flex flex-row">
                    <aside className="w-1/3 p-4">
                        <PlaylistForm
                            title={playlist.title}
                            isPublished={playlist.isPublished}
                            setPublished={(value) => setPlaylist((prevPlaylist) => ({ ...prevPlaylist, isPublished: value }))}
                            setTitle={(title) => setPlaylist((prevPlaylist) => ({ ...prevPlaylist, title }))}
                            description={playlist.description}
                            setDescription={(value) => setPlaylist((prevPlaylist) => ({ ...prevPlaylist, description: value }))}
                            submitPlaylist={() => submitPlaylist(playlist.title, playlist.description, playlist.isPublished)}
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

                        <h2>Add Videos to Playlist</h2>
                        <SimpleCardList
                            title="List of videos available"
                            items={videoItems}
                            className="overflow-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                        />
                    </aside>

                    <div className="w-2/3 p-4">
                        <h2>Current Playlist</h2>
                        <div>
                            <p>Playlist duration : {getDurationInFormat(totalDuration)}</p>
                        </div>
                        <CardList
                            title=""
                            items={playlistItems}
                            onListChange={onListChange}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
