'use client'

import { useStreamStore } from "#stores/useStreamStore";
import Button from "@/components/_forms/Button.jsx";
import Link from "next/link";

export default function StreamsShowView({ handleStart, handleStop, handleRestart }) {
    const stream = useStreamStore.use.selectedStream();

    if (!stream) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50">
            <div className="mb-4">
                {stream.status === 'inactive' ? (
                    <Button
                        label="Start Stream"
                        onClick={() => handleStart(stream.id)}
                        type="submit"
                    />
                ) : (
                    <div className="flex gap-4">
                        <Button
                            label="Stop Stream"
                            onClick={() => handleStop(stream.id)}
                            type="reset"
                        />
                        <Button
                            label="Restart Stream"
                            onClick={() => handleRestart(stream.id)}
                            type="submit"
                        />
                    </div>
                )}
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">Stream Details</h2>
                <p><strong>Stream name:</strong> {stream.name}</p>
                <p><strong>Stream Status:</strong> {stream.status}</p>
                <p><strong>Type of providers:</strong> {stream.type}</p>
                <p><strong>Timeline associated:</strong> <Link href={`/timelines/${stream.timeline.id}`} className="text-blue-500 hover:underline">{stream.timeline.title}</Link></p>
                <p><strong>Created by:</strong> {stream.user.username}</p>
            </div>

            <div className="mt-4">
                <h2 className="text-xl font-semibold">Stream Live Status</h2>
                {stream.status === "active" ? (
                    <>
                        <p><strong>Current Position:</strong> {stream.currentIndex + 1}</p>
                        <p><strong>Current video in live:</strong> {stream.currentVideo?.title}</p>
                    </>
                ) : (
                    <p>Stream is not active</p>
                )}
            </div>
        </div>
    );
}
