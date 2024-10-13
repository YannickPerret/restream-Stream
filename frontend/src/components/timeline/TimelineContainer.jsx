import React, { useEffect, useState } from 'react';
import { useTimelineStore } from '#stores/useTimelineStore';
import { useVideoStore } from '#stores/useVideoStore';
import { usePlaylistStore } from '#stores/usePlaylistStore';
import { TimelineApi } from '#api/timeline';
import TimelineVideoList from "#components/timeline/video/TimelineVideoList.jsx";
import TimelinePlaylistList from "#components/timeline/playlist/TimelinePlaylistList.jsx";
import TimelineSwitcher from "#components/timeline/switch/TimelineSwitcher.jsx";
import Search from "#components/_forms/Search.jsx";
import Checkbox from "#components/_forms/Checkbox.jsx";
import Input from "#components/_forms/Input.jsx";
import Button from "#components/_forms/Button.jsx";

const TimelineContainer = () => {
    const fetchVideos = useVideoStore.use.fetchVideos();
    const fetchPlaylists = usePlaylistStore.use.fetchPlaylists();
    const { timelineItems, autoTransition, setAutoTransition, selectedTimeline, setTimelineItems, locale, setVideoTransition, newTimeline, setNewTimeline } = useTimelineStore();

    useEffect(() => {
        fetchVideos();
        fetchPlaylists();
    }, [fetchVideos, fetchPlaylists]);


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


    const removeVideo = (index) => {
        useTimelineStore.getState().removeVideoFromTimeline(index);
    };

    const moveVideo = (fromIndex, toIndex) => {
        useTimelineStore.getState().moveVideoInTimeline(fromIndex, toIndex);
    };

    const handleCreateTimeline = async (name) => {
        try {
            console.log('timeline', newTimeline);
            const createdTimeline = await TimelineApi.create(newTimeline);

            if (createdTimeline) {
                console.log('Timeline created successfully');
            }
        } catch (error) {
            console.error('Error creating timeline:', error);
        }
    };


    return (
        <div className="flex flex-col space-y-8 p-6 bg-gray-900 rounded-lg shadow-lg">
            <div className="flex flex-row items-center space-x-4 mb-8">
                <Input
                    type={'text'}
                    value={newTimeline.title}
                    onChange={(e) => setNewTimeline('title', e.target.value)}
                    placeholder={'Enter playlist name'}
                    className={'flex-1 bg-gray-800 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'}
                    required={true}
                />

                <Button
                    label={'Create a new Playlist'}
                    onClick={handleCreateTimeline}
                    className="text-white py-3 px-6 rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md" />
            </div>

            <TimelineSwitcher
                timeline={timelineItems}
                removeVideo={removeVideo}
                moveVideo={moveVideo}
                locale={locale}
                className="flex-grow"
            />

            <div className="flex flex-col space-y-8 mt-8">
                <div className="flex flex-row items-center space-x-4 mb-8 bg-gray-800 p-4 rounded-lg shadow-md">
                    <Checkbox
                        label={'Add auto transition'}
                        checked={autoTransition}
                        onChange={(e) => setAutoTransition(e.target.checked)}
                    />
                    <div className="flex-1">
                        <Search
                            searchUrl="videos"
                            updateSelectedItems={setVideoTransition}
                            label="Select transition video"
                            placeholder="Rechercher une vidéo"
                            displayFields={['title']}
                            multiple={false}
                        />
                    </div>
                </div>

                <div className="flex flex-row space-x-8">
                    <div className="w-1/2 p-6 bg-gray-800 rounded-lg shadow-md transition-transform duration-200 transform hover:scale-105">
                        <h2 className="text-xl font-bold text-white mb-4">Videos</h2>
                        <TimelineVideoList/>
                    </div>
                    <div className="w-1/2 p-6 bg-gray-800 rounded-lg shadow-md transition-transform duration-200 transform hover:scale-105">
                        <h2 className="text-xl font-bold text-white mb-4">Playlists</h2>
                        <TimelinePlaylistList/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineContainer;