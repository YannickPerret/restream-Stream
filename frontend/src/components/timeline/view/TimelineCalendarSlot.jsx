import React from 'react';

const TimelineCalendarSlot = ({ day, timeSlots, isPastDay, isToday, now }) => {
    return (
        <div className={`col-span-1 border-x ${isPastDay ? 'bg-gray-600' : ''} day-column`}>
            <h3 className="text-lg font-bold text-white mb-2 text-center">{day.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
            <div className="space-y-0 relative">
                {timeSlots.map((slot, index) => {
                    const slotTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), slot.getHours(), slot.getMinutes());
                    const isPast = slotTime < now;
                    const isNow = isToday && now >= slotTime && now < new Date(slotTime.getTime() + 30 * 60000);

                    let cellHeight = 'h-12';
                    if (isNow) {
                        const minutesIntoSlot = (now.getTime() - slotTime.getTime()) / (1000 * 60);
                        const heightPercentage = (minutesIntoSlot / 30) * 100;
                        cellHeight = `h-[${heightPercentage}%]`;
                    }

                    return (
                        <div
                            key={index}
                            className={`${cellHeight} border-b border-gray-700 relative flex items-center ${isPast && isToday ? 'bg-gray-600' : ''}`}>
                            {isNow && (
                                <div className="absolute w-full h-0.5 bg-red-500 top-1/2 transform -translate-y-1/2"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineCalendarSlot;
