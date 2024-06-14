'use client'
import {TimelineApi} from "#api/timeline.js";
import {useEffect} from "react";
import {useTimelineStore} from "#stores/useTimelineStore.js";
import TimelineIndexView from "@/views/timelines/index.js";

export default function TimelinesIndexPage() {
    const getTimelines = useTimelineStore.use.fetchTimelines()
    useEffect(() => {
        const fetchTimelines = async () => {
            await getTimelines();
        };
        fetchTimelines();
    }, []);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Your Timelines</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>

                </header>

                <TimelineIndexView/>
            </div>
        </section>
    );
}