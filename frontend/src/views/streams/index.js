'use client'
import { useEffect, useState } from "react";
import { StreamApi } from "#api/stream.js";
import { useStreamStore } from "#stores/useStreamStore.js";
import Link from "next/link";
import transmit from '#libs/transmit';

export default function StreamPageIndex() {
    const streams = useStreamStore.use.streams();
    const updateStreamStatus = useStreamStore.use.updateStreamStatus();
    const updateCurrentVideo = useStreamStore.use.updateCurrentVideo();
    const deleteStreamById = useStreamStore.use.deleteStreamById();
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        const createSubscriptions = async () => {
            const newSubscriptions = [];
            for (const stream of streams) {
                const sub = transmit.subscription(`streams/${stream.id}/currentVideo`);
                await sub.create();
                newSubscriptions.push({ id: stream.id, subscription: sub });

                if (stream.status === 'active') {
                    sub.onMessage(({ currentVideo }) => {
                        updateCurrentVideo(stream.id, currentVideo);
                    });
                }
            }
            setSubscriptions(newSubscriptions);
        };

        createSubscriptions();
        return () => {
            subscriptions.forEach(sub => sub.subscription.delete());
        };
    }, [streams]);

    const handleStart = async (id) => {
        const subscription = subscriptions.find(sub => sub.id === id);
        if (subscription) {
            subscription.subscription.onMessage(({ currentVideo }) => {
                console.log('currentVideo', currentVideo);
                updateCurrentVideo(id, currentVideo);
            });
        }
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
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" >
                <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Primary Provider</th>
                    <th scope="col" className="px-6 py-3">Start Time</th>
                    <th scope="col" className="px-6 py-3">Timeline</th>
                    <th scope="col" className="px-6 py-3">Current Video</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                {streams.map(stream => (
                    <tr key={stream.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">

                        <th scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"><Link
                            href={`/streams/${stream.id}`}>{stream.name} </Link></th>
                        <td>{stream.primaryProvider ? (
                            <Link href={`/providers/${stream.primaryProvider.id}`}>{stream.primaryProvider?.name}</Link>
                        ) : (
                            'None'
                        )}
                        </td>
                        <td>{new Date(stream.startTime).toUTCString()}</td>
                        <td>
                            <Link href={`/streams/${stream.id}/timeline`}>{stream.timeline.title}</Link>
                        </td>
                        <td>
                            {stream.currentVideo ? stream.currentVideo.title : 'No video playing'}
                        </td>
                        <td>{stream.status}</td>

                        <td>
                            {stream.status === 'inactive' ? (
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleStart(stream.id)}>Start</button>
                            ) : (
                                <>
                                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleStop(stream.id)}>Stop</button>
                                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleRestart(stream.id)}>Restart</button>
                                </>
                            )}
                            <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleRemove(stream.id)}>Remove</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
