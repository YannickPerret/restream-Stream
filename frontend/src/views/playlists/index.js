import {usePlaylistStore} from "#stores/usePlaylistStore"


export default function PlaylistIndexView() {
    const playlists = usePlaylistStore.use.playlists()


    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" >
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3">Is Published</th>

                    </tr>
                </thead>

                <tbody>
                    {playlists.map(playlist => (
                        <tr key={provider.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{playlist.name}</th>
                            <td>{playlist.description}</td>
                            <td>{playlist.isPublished}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}