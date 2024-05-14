import {usePlaylistStore} from "#stores/usePlaylistStore"
import {getDurationInFormat} from "#helpers/time.js";
import {boolenStringFormat} from "#helpers/string.js";
import {useTimelineStore} from "#stores/useTimelineStore.js";


export default function TimelineIndexView() {
    const timelines = useTimelineStore.use.timelines()
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
                    {timelines.map(timeline => (
                        <tr key={timeline.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{timeline.title}</th>
                            <td>{timeline.description}</td>
                            <td>{boolenStringFormat(timeline.isPublished)}</td>
                            <td>{getDurationInFormat(timeline.items.reduce((acc, video) => acc + video.duration, 0))}</td>
                            <td>
                                <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}