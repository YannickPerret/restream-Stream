'use client';

import { useEffect } from "react";
import { usePlaylistStore } from "#stores/usePlaylistStore";
import PlaylistIndexView from "@/views/playlists";
import Link from "next/link";
import Panel from "#components/layout/panel/Panel.jsx";

export default function PlaylistIndexPage() {
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists();

    useEffect(() => {
        const getPlaylists = async () => {
            await fetchPlaylists();
        };
        getPlaylists();
    }, [fetchPlaylists]);

    return (
        <Panel title="Playlists" className="p-6" darkMode={true} breadcrumbPath={[
            { label: 'Home', href: '/' },
            { label: 'Playlists', href: '/playlists' },
        ]} buttonLabel={'Add New Playlist'} buttonLink={'/playlists/create'}>

                <PlaylistIndexView/>
        </Panel>
    );
}
