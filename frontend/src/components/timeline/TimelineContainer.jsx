import React, { useEffect, useState } from 'react';
import { useTimelineStore } from '#stores/useTimelineStore';
import { useVideoStore } from '#stores/useVideoStore';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import { TimelineApi } from '#api/timeline';
import TimelineVideoList from "#components/timeline/video/TimelineVideoList.jsx";
import TimelineControlPanel from "#components/timeline/TimelineControlPanel.jsx";
import TimelinePlaylistList from "#components/timeline/playlist/TimelinePlaylistList.jsx";
import TimelineSwitchLocal from "#components/timeline/switch/TimelineSwitchLocal.jsx";
import TimelineSwitcher from "#components/timeline/switch/TimelineSwitcher.jsx";

const TimelineContainer = () => {
    const [locale, setLocale] = useState('en-US');
    const fetchVideos = useVideoStore.use.fetchVideos();
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists();
    const { timelineItems, addPlaylistToTimeline, addAutoTransition, videoTransition, selectedTimeline, setTimelineItems } = useTimelineStore();

    useEffect(() => {
        fetchVideos(); // Récupère les vidéos disponibles
        fetchPlaylists(); // Récupère les playlists disponibles
    }, [fetchVideos, fetchPlaylists]);

    const handleLocaleChange = (newLocale) => {
        setLocale(newLocale);
    };

    const addVideo = (video) => {
        const now = new Date();
        const timelineItems = useTimelineStore.getState().timelineItems;
        const lastItem = timelineItems.length ? timelineItems[timelineItems.length - 1] : null;

        let startTime;
        if (!lastItem) {
            // Si la timeline est vide, commence à l'heure actuelle
            startTime = now;
        } else {
            // Sinon, commence à la fin de la dernière vidéo
            startTime = new Date(lastItem.endTime);
        }

        let endTime = new Date(startTime);
        // Conversion de la durée de secondes en minutes
        const durationInMinutes = video.duration / 60;
        endTime.setMinutes(endTime.getMinutes() + durationInMinutes);

        const newTimelineItem = {
            video,
            startTime: startTime.toISOString(), // Convertir en format ISO 8601
            endTime: endTime.toISOString(),     // Convertir en format ISO 8601
        };

        useTimelineStore.setState((state) => ({
            timelineItems: [...state.timelineItems, newTimelineItem],
        }));
    };

    const resetTimeline = () => {
        const now = new Date();
        const resetItems = timelineItems.map((item, index) => {
            const startTime = new Date(now);
            startTime.setMinutes(now.getMinutes() + (index === 0 ? 0 : timelineItems[index - 1].video.duration));
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + item.video.duration);

            return {
                ...item,
                startTime,
                endTime
            };
        });

        setTimelineItems({ timelineItems: resetItems });
    };

    useEffect(() => {
        if (selectedTimeline) {
            resetTimeline();
        }
    }, [selectedTimeline]);

    const addPlaylist = (playlist) => {
        addPlaylistToTimeline(playlist);
    };

    const removeVideo = (index) => {
        useTimelineStore.getState().removeVideoFromTimeline(index);
    };

    const moveVideo = (fromIndex, toIndex) => {
        useTimelineStore.getState().moveVideoInTimeline(fromIndex, toIndex);
    };

    const handleCreatePlaylist = async (name) => {
        try {
            const itemsForBackend = timelineItems.map((item, index) => ({
                type: 'video', // Assuming all items are videos; adjust if playlists are included
                itemId: item.video.id,
                order: index
            }));

            const newTimeline = await TimelineApi.create({
                title: name,
                items: itemsForBackend,
            });

            if (newTimeline) {
                console.log('Timeline created successfully');
            }
        } catch (error) {
            console.error('Error creating timeline:', error);
        }
    };

    return (
        <div className="timeline-container flex flex-col space-y-16">
            <TimelineControlPanel
                addAutoTransition={addAutoTransition}
                videoTransition={videoTransition}
                setAddAutoTransition={useTimelineStore.getState().setAddAutoTransition}
                setVideoTransition={useTimelineStore.getState().setVideoTransition}
                createPlaylist={handleCreatePlaylist}
            />

            <TimelineSwitchLocal locale={locale} onChange={handleLocaleChange} />

            <TimelineSwitcher
                timeline={timelineItems}
                removeVideo={removeVideo}
                moveVideo={moveVideo}
                locale={locale}
                className="flex-grow"
            />

            <div className="flex space-x-4">
                <div className="w-1/2 p-4 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Videos</h2>
                    <TimelineVideoList onAdd={addVideo} />
                </div>
                <div className="w-1/2 p-4 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Playlists</h2>
                    <TimelinePlaylistList onAdd={addPlaylist} />
                </div>
            </div>
        </div>
    );
};

export default TimelineContainer;
