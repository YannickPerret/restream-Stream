import React, { useState } from 'react';
import { useTimelineStore } from "#stores/useTimelineStore.js";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { X } from 'lucide-react';
import {getDurationInFormat} from "#helpers/time.js";

const TimelineListView = ({ removeVideo }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const { newTimeline, clearNewTimelineItems, setNewTimeline, moveVideoInTimeline } = useTimelineStore();

    const toggleSelection = (index) => {
        setSelectedItems(prevSelected => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter(i => i !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    const handleRemoveSelected = () => {
        const newItems = newTimeline.items.filter((_, index) => !selectedItems.includes(index));
        setNewTimeline({ items: newItems });
        setSelectedItems([]);
    };

    const handleSelectAll = () => {
        if (selectedItems.length === newTimeline.items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(newTimeline.items.map((_, index) => index));
        }
    };

    const handleRemoveAll = () => {
        clearNewTimelineItems();
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const fromIndex = result.source.index;
        const toIndex = result.destination.index;
        moveVideoInTimeline(fromIndex, toIndex);
    };

    return (
        <div className="timeline-list-view">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Timeline List View</h2>
            <div className="flex justify-between mb-4">
                Timeline duration: {getDurationInFormat(newTimeline.duration)}
            </div>
            {newTimeline.items.length > 0 ? (
                <>
                    <div className="flex justify-between mb-4">
                        <button
                            onClick={handleRemoveAll}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg">
                            Clear All
                        </button>
                        {selectedItems.length > 0 && (
                            <button
                                onClick={handleRemoveSelected}
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                                disabled={selectedItems.length === 0}>
                                Remove Selected
                            </button>
                        )}
                        <button
                            onClick={handleSelectAll}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                            {selectedItems.length === newTimeline.items.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="timeline-list">
                            {(provided) => (
                                <div
                                    className="space-y-4"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {newTimeline.items.map((item, index) => (
                                        <Draggable key={index} draggableId={index.toString()} index={index}>
                                            {(provided) => (
                                                <div
                                                    className="p-4 bg-gray-700 rounded-lg flex flex-col justify-between items-start"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <div className="flex items-center w-full">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(index)}
                                                            onChange={() => toggleSelection(index)}
                                                            className="mr-4"
                                                        />
                                                        {item.type === 'playlist' ? (
                                                            <div className="w-full">
                                                                <div className="flex justify-between items-center">
                                                                    <div className="text-white font-bold text-lg">{item.title} (Playlist)</div>
                                                                    <button
                                                                        onClick={() => removeVideo(index)}
                                                                        className="text-red-500 hover:text-red-700">
                                                                        <X size={32} />
                                                                    </button>
                                                                </div>
                                                                <div className="pl-8">
                                                                    {item.videos.map((video, videoIndex) => (
                                                                        <div key={videoIndex} className="text-gray-400 mb-2">
                                                                            <h4 className="text-md">{video.title}</h4>
                                                                            <p className="text-sm">Duration: {getDurationInFormat(video.duration)}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between items-center w-full">
                                                                <div className="text-white">
                                                                    <h4 className="text-lg font-semibold">{item.title}</h4>
                                                                    <p className="text-sm text-gray-400">Duration: {getDurationInFormat(item.duration)}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeVideo(index)}
                                                                    className="text-red-500 hover:text-red-700">
                                                                    <X size={32} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </>
            ) : (
                <p className="text-white text-center">No videos in the timeline.</p>
            )}
        </div>
    );
};

export default TimelineListView;
