'use client'
import {useTimelineStore} from "#stores/useTimelineStore";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import TimelinesShowView from "@/views/timelines/show.jsx";
import {useEffect} from "react";
import {useParams} from "next/navigation";
import Panel from "#components/layout/panel/Panel.jsx";

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
        <Panel title="Timeline" className="p-6" darkMode={true} breadcrumbPath={[
            { label: 'Home', href: '/' },
            { label: 'Timelines', href: '/timelines' },
            { label: 'Timeline', href: `/timelines/${id}` },
        ]}>
                <TimelinesShowView />
        </Panel>
    )
}