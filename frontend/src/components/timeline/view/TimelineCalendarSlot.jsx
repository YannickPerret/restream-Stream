import React from 'react';

const TimelineCalendarSlot = ({ day, timeSlots, isPastDay }) => {
    return (
        <div className={`col-span-1 border-x ${isPastDay ? 'bg-gray-600' : ''} day-column`}>
            <h3 className="text-lg font-bold text-white mb-2 text-center">{day.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
            <div className="space-y-0 relative">
                {timeSlots.map((slot, index) => (
                    <div
                        key={index}
                        className={`h-12 border-b border-gray-700 relative flex items-center ${isPastDay ? 'bg-gray-600' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default TimelineCalendarSlot;