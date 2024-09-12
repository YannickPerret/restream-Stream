'use client';
import { useState } from "react";
import { useStreamStore } from "#stores/useStreamStore";
import Link from "next/link";
import StreamsEditView from "@/views/streams/edit.jsx";
import Table from "#components/table/Table";
import {StreamApi} from "#api/stream.js";

export default function StreamPageIndex() {
    const {streams, updateStreamStatus, deleteStreamById} = useStreamStore();
    const [selectedStream, setSelectedStream] = useState(null);

    const columns = [
        { title: "Name", key: "name", render: (name, stream) => <Link href={`/streams/${stream.id}`}>{name}</Link> },
        {
            title: "Primary Provider",
            key: "primaryProvider",
            render: (provider) => provider ? <Link href={`/providers/${provider.id}`}>{provider.name}</Link> : 'None'
        },
        { title: "Start Time", key: "startTime", render: (startTime) => new Date(startTime).toUTCString() },
        {
            title: "Timeline",
            key: "timeline",
            render: (timeline) => <Link href={`/timelines/${timeline.id}`}>{timeline.title}</Link>
        },
        { title: "Current Video", key: "currentVideo", render: (currentVideo) => currentVideo ? currentVideo.title : 'No video playing' },
        { title: "Status", key: "status" },
        {
            title: "Actions",
            key: "actions",
            render: (_, stream) => (
                <>
                    {stream.status === 'inactive' ? (
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleStart(stream.id)}>Start</button>
                    ) : (
                        <>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleStop(stream.id)}>Stop
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleRestart(stream.id)}>Restart
                            </button>
                        </>
                    )}
                    <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setSelectedStream(stream)}>Edit
                    </button>
                    <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleRemove(stream.id)}>Remove
                    </button>
                </>
            )
        }
    ];

    const handleStart = async (id) => {
        await StreamApi.start(id).then(async () => {
            updateStreamStatus(id, 'active');
        });
    };

    const handleStop = async (id) => {
        await StreamApi.stop(id).then(async () => {
            updateStreamStatus(id, 'inactive');
        });
    };

    const handleRestart = async (id) => {
        await StreamApi.restart(id);
    };

    const handleRemove = async (id) => {
        await StreamApi.delete(id).then(() => {
            deleteStreamById(id);
        });
    };


    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {selectedStream && (
                <StreamsEditView
                    streamToEdit={selectedStream}
                    onClose={() => setSelectedStream(null)}
                />
            )}
                <Table columns={columns} data={streams} />
        </div>
    );
}
