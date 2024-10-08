'use client'
import Link from "next/link";
import {useEffect, useState} from "react";
import { useVideoStore } from "#stores/useVideoStore";
import TimelineContainer from "#components/timeline/TimelineContainer";

export default function TimelineCreatePage() {
    const {fetchVideos, videos} = useVideoStore()

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <header className="container mx-auto mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl text-white">Create a New Timeline</h1>
                        <Link href="/timelines">
                            <button
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
                                Back to Timelines
                            </button>
                        </Link>
                    </div>
                    <hr className="border-b-1 border-gray-400 my-4"/>
                </header>

                <div className="container mx-auto">
                    <TimelineContainer/>
                </div>
            </div>

        </section>
    );
}
