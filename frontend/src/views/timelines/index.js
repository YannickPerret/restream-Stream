import { getDurationInFormat } from "#helpers/time";
import { boolenStringFormat } from "#helpers/string";
import { useTimelineStore } from "#stores/useTimelineStore";
import Link from "next/link";

export default function TimelineIndexView() {
    const timelines = useTimelineStore.use.timelines();
    const removeTimeline = useTimelineStore.use.deleteTimelineById();

    const handleRemove = async (id) => {
        await removeTimeline(id);
    };

    const calculateTotalDuration = (timeline) => {
        return timeline.items.reduce((total, item) => {
            if (item.type === 'video') {
                const video = timeline.videos.find(v => v.id === item.itemId);
                return total + (video ? video.duration : 0);
            } else if (item.type === 'playlist') {
                const playlist = timeline.videos.find(p => p.id === item.itemId);
                if (playlist && playlist.videos) {
                    return total + playlist.videos.reduce((playlistTotal, video) => {
                        return playlistTotal + (video.duration || 0);
                    }, 0);
                }
            }
            return total;
        }, 0);
    };


    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3">Is Published</th>
                    <th scope="col" className="px-6 py-3">Duration</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                {timelines.map(timeline => {
                    const totalDuration = calculateTotalDuration(timeline);
                    return (
                        <tr key={timeline.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <Link href={`/timelines/${timeline.id}`}>{timeline.title}</Link>
                            </th>
                            <td>{timeline.description}</td>
                            <td>{boolenStringFormat(timeline.isPublished)}</td>
                            <td>{getDurationInFormat(totalDuration)}</td>
                            <td>
                                <Link className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                      href={`/timelines/${timeline.id}/edit`}>Edit
                                </Link>
                                <button
                                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => handleRemove(timeline.id)}>Delete
                                </button>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}
