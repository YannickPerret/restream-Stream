import React, { useEffect } from 'react';
import { useTimelineStore } from '#stores/useTimelineStore';
import { useVideoStore } from '#stores/useVideoStore';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import TimelineVideoList from "#components/timeline/video/TimelineVideoList.jsx";
import TimelineControlPanel from "#components/timeline/TimelineControlPanel.jsx";
import TimelineViewSwitcher from "#components/timeline/TimelineViewSwitcher.jsx";
import TimelinePlaylistList from "#components/timeline/playlist/TimelinePlaylistList.jsx";

const TimelineContainer = () => {
    const fetchVideos = useVideoStore.use.fetchVideos();
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists();
    const timelineItems = useTimelineStore.use.timelineItems();
    const addAutoTransition = useTimelineStore.use.addAutoTransition();
    const videoTransition = useTimelineStore.use.videoTransition();

    useEffect(() => {
        fetchVideos(); // Récupère les vidéos disponibles
        fetchPlaylists(); // Récupère les playlists disponibles
    }, [fetchVideos, fetchPlaylists]);

    const addVideo = (video) => {
        useTimelineStore.getState().addVideoToTimeline(video);
    };

    const addPlaylist = (playlist) => {
        // Ajoute la playlist à la timeline (peut-être avec une logique spécifique pour gérer les playlists)
        useTimelineStore.getState().addVideoToTimeline(playlist);
    };

    const removeVideo = (index) => {
        useTimelineStore.getState().removeVideoFromTimeline(index);
    };

    const moveVideo = (fromIndex, toIndex) => {
        useTimelineStore.getState().moveVideoInTimeline(fromIndex, toIndex);
    };

    return (
        <div className="timeline-container flex flex-col space-y-16">
            <TimelineControlPanel
                addAutoTransition={addAutoTransition}
                videoTransition={videoTransition}
                setAddAutoTransition={useTimelineStore.getState().setAddAutoTransition}
                setVideoTransition={useTimelineStore.getState().setVideoTransition}
            />

            <TimelineViewSwitcher
                timeline={timelineItems}
                removeVideo={removeVideo}
                moveVideo={moveVideo}
                className="flex-grow"
            />


            <div className="flex space-x-4">
                <div className="w-1/2 p-4 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Videos</h2>
                    <TimelineVideoList onAdd={addVideo}/>
                </div>
                <div className="w-1/2 p-4 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Playlists</h2>
                    <TimelinePlaylistList onAdd={addPlaylist}/>
                </div>
            </div>
        </div>
    );
};

export default TimelineContainer;
