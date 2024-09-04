import React from 'react';

const TimelineListView = ({ timeline, removeVideo, moveVideo }) => {
    return (
        <div className="timeline-list-view">
            <h2 className="text-2xl font-bold text-white mb-4">Timeline List View</h2>
            <div className="space-y-4">
                {timeline.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                        <div className="text-white">
                            <h4 className="text-lg font-semibold">{item.video.title}</h4>
                            <p className="text-sm text-gray-400">
                                Start: {new Date(item.startTime).toLocaleTimeString()} -
                                End: {new Date(item.endTime).toLocaleTimeString()}
                            </p>
                            <p className="text-sm text-gray-400">Duration: {item.video.duration} minutes</p>
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
                ))}
            </div>
        </div>
    );
};

export default TimelineListView;
