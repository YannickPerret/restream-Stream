import React, { useState } from 'react';

const TimelineListView = ({ timeline, removeVideo, moveVideo, clearTimeline }) => {
    const [selectedItems, setSelectedItems] = useState([]);

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
        selectedItems.sort((a, b) => b - a).forEach(index => removeVideo(index));
        setSelectedItems([]); // Reset selection after deletion
    };

    const handleSelectAll = () => {
        if (selectedItems.length === timeline.length) {
            setSelectedItems([]); // Deselect all if all are selected
        } else {
            setSelectedItems(timeline.map((_, index) => index)); // Select all
        }
    };

    return (
        <div className="timeline-list-view">
            <h2 className="text-2xl font-bold text-white mb-4">Timeline List View</h2>
            <div className="flex justify-between mb-4">
                <button
                    onClick={clearTimeline}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                    Clear All
                </button>
                <button
                    onClick={handleRemoveSelected}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                    disabled={selectedItems.length === 0}
                >
                    Remove Selected
                </button>
                <button
                    onClick={handleSelectAll}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                    {selectedItems.length === timeline.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            <div className="space-y-4">
                {timeline.length > 0 ? (
                    timeline.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(index)}
                                    onChange={() => toggleSelection(index)}
                                    className="mr-4"
                                />
                                <div className="text-white">
                                    <h4 className="text-lg font-semibold">{item.video?.title}</h4>
                                    <p className="text-sm text-gray-400">
                                        Start: {new Date(item.startTime).toLocaleTimeString()} -
                                        End: {new Date(item.endTime).toLocaleTimeString()}
                                    </p>
                                    <p className="text-sm text-gray-400">Duration: {item.video.duration} minutes</p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => moveVideo(index, index - 1)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-lg"
                                    disabled={index === 0}
                                >
                                    Up
                                </button>
                                <button
                                    onClick={() => moveVideo(index, index + 1)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-lg"
                                    disabled={index === timeline.length - 1}
                                >
                                    Down
                                </button>
                                <button
                                    onClick={() => removeVideo(index)}
                                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-lg"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-white">
                        Timeline is empty
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineListView;
