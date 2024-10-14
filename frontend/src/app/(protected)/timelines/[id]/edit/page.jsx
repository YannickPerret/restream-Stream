'use client';
import React, { useEffect, useState } from 'react';
import {useVideoStore} from "#stores/useVideoStore";
import Link from "next/link";
import PlaylistEditView from "@/views/playlists/edit";
import {useParams} from "next/navigation";
import {usePlaylistStore} from "#stores/usePlaylistStore";
import {useTimelineStore} from "#stores/useTimelineStore.js";
import TimelinesEditView from "@/views/timelines/edit.jsx";
import Panel from "#components/layout/panel/Panel.jsx";

export default function TimelinesEditPage() {
    const { id } = useParams();
    const getVideos = useVideoStore.use.fetchVideos();
    const getPlaylists = usePlaylistStore.use.fetchPlaylists();
    const getTimelines = useTimelineStore.use.fetchTimelineById();

    useEffect(() => {
        const fetchTimeline = async () => {
            await getVideos();
            await getPlaylists();
            await getTimelines(id);
        }
        fetchTimeline();
    }, [id]);


    return (
        <Panel title={`Edit the Timeline`} className="p-6" darkMode={true} breadcrumbPath={[
            { label: 'Home', href: '/' },
            { label: 'Timelines', href: '/timelines' },
            { label: 'Edit', href: `/timelines/${id}/edit` },
        ]} buttonLink={{ label: 'Back to the timeline', href: `/timelines/${id}` }}>
            <TimelinesEditView />
        </Panel>
    );
}