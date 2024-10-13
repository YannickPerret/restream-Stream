import React from 'react';
import {DateTime} from "luxon";

const TimelineCalendarEvent = ({ item, dayColumnPositions, daysOfWeek, handleItemClick }) => {
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);

    const getDayIndex = (date) => {
        return daysOfWeek.findIndex(day => day.toISODate() === DateTime.fromJSDate(date).toISODate());
    };

    const startDayIndex = getDayIndex(startTime);
    const endDayIndex = getDayIndex(endTime);

    const startTimeInMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endTimeInMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    if (startDayIndex === -1 || endDayIndex === -1) return null;

    const dayColumn = dayColumnPositions[startDayIndex];
    if (!dayColumn) return null;

    // Calcul de la position en pixels
    const height = (endTimeInMinutes - startTimeInMinutes) * 2; // 2px par minute
    const topPosition = startTimeInMinutes * 2; // 2px par minute

    return (
        <div
            className="absolute bg-blue-500 text-white p-2 rounded event-item"
            style={{
                top: `${topPosition}px`,
                left: dayColumn.left,
                width: dayColumn.width,
                height: `${height}px`
            }}
            onClick={handleItemClick}
        >
            {item.video.title}
        </div>
    );
};

export default TimelineCalendarEvent;
