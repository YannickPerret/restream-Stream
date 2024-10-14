'use client';
import { useState, useEffect } from "react";
import { useStreamStore } from "#stores/useStreamStore";
import Link from "next/link";
import StreamsEditView from "@/views/streams/edit.jsx";
import Table from "#components/table/Table";
import { StreamApi } from "#api/stream.js";
import { Tv } from 'lucide-react';

export default function StreamPageIndex() {
    const { streams, updateStreamStatus, deleteStreamById } = useStreamStore();
    const [selectedStream, setSelectedStream] = useState(null);

    // Column configuration
    const columns = [
        {
            title: "Status",
            key: "status",
            render: (status) =>
                status === 'active' ? (
                    <Tv className="text-green-500" />
                ) : (
                    <Tv className="text-red-500" />
                )
        },
        {
            title: "Name",
            key: "name",
            render: (name, stream) => <Link href={`/streams/${stream.id}`}>{name}</Link>
        },
        {
            title: "Channels",
            key: "providers",
            render: (providers) => providers.map((provider) => provider.name).join(", ")
        },
        {
            title: "Start Time",
            key: "startTime",
            render: (startTime) =>
                new Date(startTime).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                })
        },
        {
            title: "Time in live",
            key: "duration",
            render: (_, stream) => calculateDuration(stream.startTime)
        },
        {
            title: "Timeline",
            key: "timeline",
            render: (timeline) => <Link href={`/timelines/${timeline.id}`}>{timeline.title}</Link>
        },
        {
            title: "Current Video",
            key: "currentVideo",
            render: (currentVideo) => currentVideo ? currentVideo.title : 'No video playing'
        },
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

    // Handle the start of the stream
    const handleStart = async (id) => {
        await StreamApi.start(id).then(async () => {
            updateStreamStatus(id, 'active');
        });
    };

    // Handle stopping the stream
    const handleStop = async (id) => {
        await StreamApi.stop(id).then(async () => {
            updateStreamStatus(id, 'inactive');
        });
    };

    // Handle restarting the stream
    const handleRestart = async (id) => {
        await StreamApi.restart(id);
    };

    // Handle removing the stream
    const handleRemove = async (id) => {
        await StreamApi.delete(id).then(() => {
            deleteStreamById(id);
        });
    };

    // Function to calculate the duration from the start time
    const calculateDuration = (startTime) => {
        if (!startTime) return "N/A";
        const now = new Date();
        const start = new Date(startTime);
        const durationMs = now - start;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
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
