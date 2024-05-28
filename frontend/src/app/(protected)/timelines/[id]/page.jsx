'use client'
import {useTimelineStore} from "#stores/useTimelineStore";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import TimelinesShowView from "@/views/timelines/show.jsx";
import {useEffect} from "react";
import {useParams} from "next/navigation";

export default function TimelineShowPage() {
    const getTimeline = useTimelineStore.use.fetchTimelineById();
    const {id} = useParams();

    useEffect(() => {
        const fetchTimelines = async () => {
            if (id) await getTimeline(id);
        }
        fetchTimelines();
    }, []);


    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Show Timeline Information</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/timelines"} className={"flex"}><ArrowLeft />&nbsp; Back to Timeline</Link>
                    </div>
                </header>

                <TimelinesShowView />
            </div>
        </section>
    )
}