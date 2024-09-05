import React, { useState, useRef } from 'react';
import { DateTime } from 'luxon';
import { useTimelineStore } from '#stores/useTimelineStore';
import { generateTimeSlots } from "#helpers/timeline";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import TimelineCalendarSlotHours from "#components/timeline/view/TimelineCalendarSlotHours";
import TimelineCalendarSlot from "#components/timeline/view/TimelineCalendarSlot";
import TimelineCalendarTooltip from "#components/timeline/view/TimelineCalendarTooltip.jsx";

const TimelineCalendarView = ({ locale }) => {
    const { timelineItems } = useTimelineStore();
    const calendarRef = useRef(null);

    const [currentWeek, setCurrentWeek] = useState(DateTime.now().startOf('week'));
    const [tooltip, setTooltip] = useState({ visible: false, content: '', position: { x: 0, y: 0 } });

    const timeSlots = generateTimeSlots();
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => currentWeek.plus({ days: i }));
    console.log(daysOfWeek)
    const startOfToday = DateTime.now().startOf('day');

    const handlePreviousWeek = () => {
        setCurrentWeek(currentWeek.minus({ weeks: 1 }));
    };

    const handleNextWeek = () => {
        setCurrentWeek(currentWeek.plus({ weeks: 1 }));
    };

    let tooltipTimeout;

    const handleMouseEnter = (event, item) => {
        const boundingRect = event.target.getBoundingClientRect();
        const x = boundingRect.left + window.scrollX;
        const y = boundingRect.top + window.scrollY;

        tooltipTimeout = setTimeout(() => {
            setTooltip({
                visible: true,
                content: `${item.video.title} - ${item.video.duration} minutes`,
                position: { x, y },
            });
        }, 2000);
    };

    const handleMouseLeave = () => {
        clearTimeout(tooltipTimeout);
        setTooltip({ visible: false, content: '', position: { x: 0, y: 0 } });
    };

    return (
        <div className="p-4 relative" ref={calendarRef}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePreviousWeek} className="p-2 bg-gray-700 text-white rounded-lg">
                    <ArrowLeft/>
                </button>
                <h2 className="text-xl font-bold text-white">
                    {currentWeek.toFormat('MMMM dd, yyyy')} - {currentWeek.plus({days: 6}).toFormat('MMMM dd, yyyy')}
                </h2>
                <button onClick={handleNextWeek} className="p-2 bg-gray-700 text-white rounded-lg">
                    <ArrowRight/>
                </button>
            </div>
            <div className="grid grid-cols-8 gap-0 relative">
                <TimelineCalendarSlotHours timeSlots={timeSlots} locale={locale}/>
                {daysOfWeek.map((day, i) => (
                    <TimelineCalendarSlot
                        key={i}
                        day={day.toJSDate()}
                        timeSlots={timeSlots}
                        isPastDay={day < startOfToday}
                        isToday={day.toLocaleString(DateTime.DATE_SHORT, {locale}) === DateTime.now().toLocaleString(DateTime.DATE_SHORT, {locale})}
                        now={DateTime.now().toJSDate()}
                    />
                ))}
            </div>

            <div className="absolute top-0 left-0 right-0 bottom-0">
                {timelineItems.map((item, i) => {
                    const startTime = DateTime.fromISO(item.startTime);
                    const endTime = DateTime.fromISO(item.endTime);

                    const dayIndex = daysOfWeek.findIndex(day => day.hasSame(startTime, 'day'));
                    if (dayIndex === -1) return null;

                    const minutesFromStartOfDay = startTime.diff(startTime.startOf('day'), 'minutes').minutes;
                    const topPosition = `${(minutesFromStartOfDay / (24 * 60)) * 100}%`;

                    const durationInMinutes = endTime.diff(startTime, 'minutes').minutes;

                    if (!startTime.hasSame(endTime, 'day')) {
                        const minutesUntilMidnight = startTime.endOf('day').diff(startTime, 'minutes').minutes;
                        const heightFirstPart = `${(minutesUntilMidnight / (24 * 60)) * 100}%`;

                        const minutesAfterMidnight = endTime.diff(endTime.startOf('day'), 'minutes').minutes;
                        const heightSecondPart = `${(minutesAfterMidnight / (24 * 60)) * 100}%`;

                        return (
                            <React.Fragment key={i}>
                                <div
                                    className="absolute bg-blue-500 text-white rounded-lg p-2"
                                    style={{
                                        top: topPosition,
                                        left: `calc(${(dayIndex + 1) / 8 * 100}% + 2px)`,
                                        width: 'calc(1/8 * 100% - 4px)',
                                        height: heightFirstPart
                                    }}
                                    onMouseEnter={(event) => handleMouseEnter(event, item)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {item.video.title}
                                </div>
                                {dayIndex + 1 < daysOfWeek.length && (
                                    <div
                                        className="absolute bg-blue-500 text-white rounded-lg p-2"
                                        style={{
                                            top: 'calc(0% + 50px)',
                                            left: `calc(${(dayIndex + 2) / 8 * 100}% + 2px)`,
                                            width: 'calc(1/8 * 100% - 4px)',
                                            height: heightSecondPart
                                        }}
                                        onMouseEnter={(event) => handleMouseEnter(event, item)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.video.title}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    } else {
                        return (
                            <div
                                key={i}
                                className="absolute bg-blue-500 text-white rounded-lg p-2"
                                style={{
                                    top: topPosition,
                                    left: `calc(${(dayIndex + 1) / 8 * 100}% + 2px)`,
                                    width: 'calc(1/8 * 100% - 4px)',
                                    height: `${(durationInMinutes / (24 * 60)) * 100}%`
                                }}
                                onMouseEnter={(event) => handleMouseEnter(event, item)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {item.video.title}
                            </div>
                        );
                    }
                })}
            </div>

            {tooltip.visible && (
                <TimelineCalendarTooltip content={tooltip.content} position={tooltip.position}/>
            )}
        </div>
    );
};

export default TimelineCalendarView;
