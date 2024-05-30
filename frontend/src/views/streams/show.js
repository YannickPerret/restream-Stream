'use client'

import {useStreamStore} from "#stores/useStreamStore";
import Link from "next/link";

export default function StreamsShowView({handleStart, handleStop, handleRestart}) {
    const stream = useStreamStore.use.selectedStream();

    if (!stream) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <div>
                {stream.status ==='inactive' ?
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleStart(stream.id)}>
                    Start Stream
                </button>
                : (
                        <>
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleStop(stream.id)}>
                                Stop Stream
                            </button>
                            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleRestart(stream.id)}>
                                Restart Stream
                            </button>
                        </>
                    )}
            </div>
            <div className="shadow-md rounded p-4">
                <h2 className="text-xl font-semibold">Stream name : {stream.name}</h2>
                <p>Stream Status : {stream.status}</p>
                <p>Stream restarts every : {stream.restartTimes}</p>
                <p>Type of providers : {stream.type}</p>
                <p>Timeline associated : <Link href={`/timelines/${stream.timeline.id}`}>{stream.timeline.title}</Link></p>
                <p>Created by: {stream.user.fullName}</p>
            </div>

            <div className="mt-4">
                <h2 className="text-xl font-semibold">Streams Live</h2>
                {stream.status === "active" ? (
                    <>
                        <p>Current Position : {stream.currentIndex + 1}</p>
                        <p>Current video in live : {stream.currentVideo?.title} </p>
                    </>
                ) : (
                    <p>Stream is not active</p>
                )}
            </div>
        </div>
    )
}