'use client';
import React, { useEffect, useState } from 'react';
import {useVideoStore} from "#stores/useVideoStore";
import Link from "next/link";
import PlaylistEditView from "@/views/playlists/edit";
import {useParams} from "next/navigation";
import {usePlaylistStore} from "#stores/usePlaylistStore";
import {useTimelineStore} from "#stores/useTimelineStore.js";
import TimelinesEditView from "@/views/timelines/edit.jsx";

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
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4 ">Edit the Timeline</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />
                    <div>
                        <Link href={`/timelines/${id}`}>Back to the timeline</Link>&nbsp;| &nbsp;
                        <Link href={"/timelines"}>Back to all timeline</Link>
                    </div>
                </div>

                <TimelinesEditView />
            </div>
        </section>
    );
}