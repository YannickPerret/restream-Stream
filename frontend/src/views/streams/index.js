import {StreamApi} from "../../../api/stream";
import  {useRouter} from "next/navigation";
import {useStreamStore} from "../../../stores/useStreamStore";
import Link from "next/link";

export default function StreamPageIndex () {
    const router = useRouter();
    const streams = useStreamStore.use.streams();
    const updateStreamStatus = useStreamStore.use.updateStreamStatus()
    const removeStream = useStreamStore.use.removeStream()

    const handleStart = async (id) => {
        console.log('start', id)
        await StreamApi.start(id).then(() => {
            updateStreamStatus(id, 'active')
        })
    }

    const handleStop = async(id) => {
        console.log('stop', id)
        await StreamApi.stop(id).then(() => {
            updateStreamStatus(id, 'inactive')
        })
    }

    const handleRestart = async (id) => {
        console.log('restart', id)
        await StreamApi.restart(id)
    }

    const handleRemove = async (id) => {
        console.log('remove', id)
        await StreamApi.delete(id).then(() => {
            removeStream(id)
        })
    }

    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Primary Provider</th>
                    <th>Start Time</th>
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
                        <td>{stream.startTime}</td>
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
    )
}