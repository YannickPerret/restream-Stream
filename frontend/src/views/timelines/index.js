'use client';
import { getDurationInFormat } from "#helpers/time";
import { boolenStringFormat } from "#helpers/string";
import { useTimelineStore } from "#stores/useTimelineStore";
import Link from "next/link";
import Table from "#components/table/Table";

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

    const columns = [
        { title: "Name", key: "title", render: (text, timeline) => <Link href={`/timelines/${timeline.id}`}>{text}</Link> },
        { title: "Description", key: "description" },
        { title: "Is Published", key: "isPublished", render: (value) => boolenStringFormat(value) },
        { title: "Duration", key: "duration", render: (_, timeline) => getDurationInFormat(calculateTotalDuration(timeline)) },
        {
            title: "Actions",
            key: "actions",
            render: (_, timeline) => (
                <div className="flex space-x-4">
                    <Link className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                          href={`/timelines/${timeline.id}/edit`}>Edit
                    </Link>
                    <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleRemove(timeline.id)}>Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <Table columns={columns} data={timelines} />
        </div>
    );
}
