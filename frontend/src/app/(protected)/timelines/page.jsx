'use client';
import { useEffect } from 'react';
import { useTimelineStore } from "#stores/useTimelineStore";
import TimelineIndexView from "@/views/timelines";
import Link from "next/link";
import Panel from "#components/layout/panel/Panel.jsx";

export default function TimelinesIndexPage() {
    const getTimelines = useTimelineStore.use.fetchTimelines();

    useEffect(() => {
        const fetchTimelines = async () => {
            await getTimelines();
        };
        fetchTimelines();
    }, [getTimelines]);

    return (
        <Panel title={`Timelines`} className="p-6" darkMode={true} breadcrumbPath={[
            { label: 'Home', href: '/' },
            { label: 'Timelines', href: '/timelines' },
        ]} buttonLink={'/timelines/create'} buttonLabel={'Create a new timeline'}>
                <TimelineIndexView/>
        </Panel>
    );
}
