'use client'
import React from 'react';
import { usePlaylistStore} from "#stores/usePlaylistStore";
import {getDurationInFormat} from "#helpers/time";
import VideoCard from "#components/videos/card";

export default function PlaylistShowView() {
    const playlist = usePlaylistStore.use.selectedPlaylist()

    if (!playlist) {
        return <div>Loading...</div>;
    }
    console.log(playlist)
    return (
        <div className="p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Playlist information :</h2>

                <div className="shadow-md rounded p-4">
                    <h2 className="text-xl font-semibold">Playlist name : {playlist.title}</h2>
                    <p>Playlist description : {playlist.description}</p>
                    <p>Playlist duration : {getDurationInFormat(playlist.videos.reduce((acc, video) => acc + video.duration, 0))}</p>
                    <p>Created by: {playlist.user.fullName}</p>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Playlist Videos :</h2>
                <ul>
                    {playlist.videos.map((item, index) => (
                        <li key={index} className="mb-4">
                            <VideoCard
                                title={`${index + 1} ${item.title}`}
                                footer={
                                    <span>Duration: {getDurationInFormat(item.duration)}<br />
                                        {item.guest ? (
                                            <>
                                                {item.user && <span>Validate by: {item.user.fullName}</span>}<br />
                                                {item.guest && <span>Upload by Guest: {item.guest.username}</span>}
                                            </>
                                        ) : (
                                            <span>Upload by: {item.user.fullName}</span>
                                        )}
                                    </span>
                                }>
                                <p>{item.description ? item.description : "No description"}</p>
                            </VideoCard>
                        </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}