import {usePlaylistStore} from "#stores/usePlaylistStore"
import {getDurationInFormat} from "#helpers/time.js";
import {boolenStringFormat} from "#helpers/string.js";
import Link from "next/link";
import GuestsEditView from "@/views/guests/edit.jsx";
import {useState} from "react";


export default function PlaylistIndexView() {
    const playlists = usePlaylistStore.use.playlists()
    const deletePlaylist = usePlaylistStore.use.deletePlaylistById();

    if(!playlists) {
        return <div>Loading...</div>
    }

    const handleRemove = async (id) => {
        await deletePlaylist(id);
    }

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" >
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3">Is Published</th>
                        <th scope="col" className="px-6 py-3">Duration</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {playlists.map(playlist => (
                        <tr key={playlist.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <Link href={`/playlists/${playlist.id}`}>{playlist.title}</Link>
                            </th>
                            <td>{playlist.description}</td>
                            <td>{boolenStringFormat(playlist.isPublished)}</td>
                            <td>{getDurationInFormat(playlist.videos.reduce((acc, video) => acc + video.duration, 0))}</td>
                            <td>
                                <Link className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                        href={`playlists/${playlist.id}/edit`}>Edit
                                </Link>
                                <button
                                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => handleRemove(playlist.id)}>Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}