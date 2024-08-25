'use client';
import { useState } from "react";
import { usePlaylistStore } from "#stores/usePlaylistStore";
import Link from "next/link";
import Table from "#components/table/Table";

export default function PlaylistIndexView() {
    const playlists = usePlaylistStore.use.playlists();
    const deletePlaylist = usePlaylistStore.use.deletePlaylistById();

    if (!playlists) {
        return <div>Loading...</div>;
    }

    const handleRemove = async (id) => {
        await deletePlaylist(id);
    };

    const columns = [
        { title: "Name", key: "title", render: (text, playlist) => <Link href={`/playlists/${playlist.id}`}>{text}</Link> },
        { title: "Description", key: "description" },
        { title: "Is Published", key: "isPublished", render: (value) => boolenStringFormat(value) },
        { title: "Duration", key: "duration", render: (_, playlist) => getDurationInFormat(playlist.videos.reduce((acc, video) => acc + video.duration, 0)) },
        {
            title: "Actions",
            key: "actions",
            render: (_, playlist) => (
                <div className="flex space-x-4">
                    <Link className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                          href={`playlists/${playlist.id}/edit`}>Edit
                    </Link>
                    <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleRemove(playlist.id)}>Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <Table columns={columns} data={playlists} />
        </div>
    );
}
