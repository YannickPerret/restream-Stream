'use client'
import Link from "next/link";
import {useEffect, useState} from "react";
import { useVideoStore } from "#stores/useVideoStore";
import TimelineContainer from "#components/timeline/TimelineContainer";
import Panel from "#components/layout/panel/Panel.jsx";

export default function TimelineCreatePage() {
    const {fetchVideos, videos} = useVideoStore()

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    return (
        <Panel title="Create a New Timeline" className="p-6" darkMode={true} breadcrumbPath={[
            { label: 'Home', href: '/' },
            { label: 'Timelines', href: '/timelines' },
            { label: 'Create', href: '/timelines/create' },
        ]} buttonLink={{ label: 'Back to Timelines', href: '/timelines' }}>
            <TimelineContainer/>
        </Panel>
    );
}
