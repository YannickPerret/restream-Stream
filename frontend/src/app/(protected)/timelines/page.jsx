'use client';
import { useEffect } from 'react';
import { useTimelineStore } from "#stores/useTimelineStore";
import TimelineIndexView from "@/views/timelines";
import Link from "next/link";

export default function TimelinesIndexPage() {
    const getTimelines = useTimelineStore.use.fetchTimelines();

    useEffect(() => {
        const fetchTimelines = async () => {
            await getTimelines();
        };
        fetchTimelines();
    }, [getTimelines]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Your Timelines</h1>
                    <Link href="/timelines/create">
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Add New Timeline
                        </button>
                    </Link>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>
                <TimelineIndexView/>
            </div>
        </section>
    );
}
