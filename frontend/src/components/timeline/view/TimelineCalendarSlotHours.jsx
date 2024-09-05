import React from 'react';

const TimelineCalendarSlotHours = ({ timeSlots, locale }) => {
    return (
        <div className="col-span-1 mt-9">
            {timeSlots.map((slot, index) => (
                <div key={index} className="h-12 border-b border-gray-700 text-right pr-2 text-gray-400 flex items-center">
                    {slot.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </div>
            ))}
        </div>
    );
};

export default TimelineCalendarSlotHours;
