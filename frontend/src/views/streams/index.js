import { useEffect } from "react";
import { StreamApi } from "#api/stream.js";
import { useRouter } from "next/navigation";
import { useStreamStore } from "#stores/useStreamStore.js";
import Link from "next/link";
import transmit from '#libs/transmit';

export default function StreamPageIndex() {
    const router = useRouter();
    const streams = useStreamStore.use.streams();
    const updateStreamStatus = useStreamStore.use.updateStreamStatus();
    const removeStream = useStreamStore.use.removeStream();
    const updateCurrentVideo = useStreamStore.use.updateCurrentVideo();
    const addSubscription = useStreamStore.use.addSubscription();
    const subscriptions = useStreamStore.use.subscriptions();

    const handleStart = async (id) => {
        await StreamApi.start(id).then(async () => {
            updateStreamStatus(id, 'active');
            const subscription = transmit.subscription(`stream/${id}/currentVideo`);
            await subscription.create();
            subscription.onMessage(({currentVideo}) => {
                console.log(currentVideo)
                updateCurrentVideo(id, currentVideo);
            });
            addSubscription(id, subscription);
        });
    };

    useEffect(() => {
        console.log(subscriptions)
        if (subscriptions.length === 0) return;
        subscriptions.forEach(subscription => {
            subscription.onMessage(({currentVideo}) => {
                console.log(currentVideo)
                updateCurrentVideo(subscription.id, currentVideo);
            });
        });
    }, [subscriptions]);


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
            removeStream(id);
        });
    };

    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Primary Provider</th>
                    <th>Start Time</th>
                    <th>Timeline</th>
                    <th>Current Video</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {streams.map(stream => (
                    <tr key={stream.id}>
                        <td>{stream.status}</td>
                        <td>{stream.name}</td>
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
                        <td>
                            {stream.status === 'inactive' ? (
                                <>
                                    <button onClick={() => handleStart(stream.id)}>Start</button>
                                    <button onClick={() => router.push(`/streams/${stream.id}`)}>View</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleStop(stream.id)}>Stop</button>
                                    <button onClick={() => handleRestart(stream.id)}>Restart</button>
                                </>
                            )}
                            <button onClick={() => handleRemove(stream.id)}>Remove</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
