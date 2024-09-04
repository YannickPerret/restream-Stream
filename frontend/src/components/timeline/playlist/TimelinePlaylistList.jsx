import React, { useEffect } from 'react';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import TimelinePlaylistItem from './TimelinePlaylistItem';

const TimelinePlaylistList = ({ onAdd }) => {
    const playlists = usePlaylistStore.use.playlists();
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists();

    useEffect(() => {
        fetchPlaylists(); // Récupère les playlists disponibles au chargement du composant
    }, [fetchPlaylists]);

    return (
        <div className="timeline-playlist-list">
            {playlists.map(playlist => (
                <TimelinePlaylistItem
                    key={playlist.id}
                    playlist={playlist}
                    onAdd={onAdd}
                />
            ))}
        </div>
    );
};

export default TimelinePlaylistList;
