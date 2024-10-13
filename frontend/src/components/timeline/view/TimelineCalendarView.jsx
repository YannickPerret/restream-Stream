'use client'
import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DateTime } from 'luxon';
import { useTimelineStore } from '#stores/useTimelineStore.js';

export const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(DateTime.now());
    const { locale, newTimeline } = useTimelineStore();
    const calendarRef = useRef(null);
    const [startDateTime, setStartDateTime] = useState("");
    const [calendarEvents, setCalendarEvents] = useState([]);

    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.setOption('locale', locale);
        }
    }, [locale]);

    useEffect(() => {
        const initialTime = startDateTime ? DateTime.fromISO(startDateTime) : DateTime.now();
        if (newTimeline.items.length > 0) {
            updateTimelineItems(initialTime);
        }
    }, [startDateTime, newTimeline.items.length]);

    const updateTimelineItems = (startTime) => {
        const itemsWithCalculatedTimes = [];
        let currentTime = startTime;

        newTimeline.items.forEach(item => {
            if (item.type === 'video') {
                const endTime = currentTime.plus({ seconds: item.duration });

                itemsWithCalculatedTimes.push({
                    title: `${item.title}`,
                    start: currentTime.toISO(),
                    end: endTime.toISO(),
                    extendedProps: { type: 'video', duration: item.duration }
                });

                currentTime = endTime.plus({ seconds: 1 });
            }
            else if (item.type === 'playlist' && item.videos && item.videos.length > 0) {
                const playlistStartTime = currentTime;
                const playlistEndTime = playlistStartTime.plus({ seconds: item.duration });

                itemsWithCalculatedTimes.push({
                    title: `${item.title} (Playlist)`,
                    start: playlistStartTime.toISO(),
                    end: playlistEndTime.toISO(),
                    extendedProps: {
                        type: 'playlist',
                        videos: item.videos,
                    },
                    color: 'green',
                });

                currentTime = playlistEndTime.plus({ seconds: 1 });
            }

            else if (item.type === 'transition' && item.videos && item.videos.length > 0) {
                const playlistStartTime = currentTime;
                const playlistEndTime = playlistStartTime.plus({ seconds: item.duration });

                itemsWithCalculatedTimes.push({
                    title: `${item.title} (Playlist)`,
                    start: playlistStartTime.toISO(),
                    end: playlistEndTime.toISO(),
                    extendedProps: {
                        type: 'playlist',
                        videos: item.videos,
                    },
                    color: 'violet',
                });

                currentTime = playlistEndTime.plus({ seconds: 1 });
            }
        });

        setCalendarEvents(itemsWithCalculatedTimes);
    };

    const handlePrevWeek = () => {
        if (calendarRef.current) {
            calendarRef.current.getApi().prev();
            setCurrentDate(calendarRef.current.getApi().getDate());
        }
    };

    const handleNextWeek = () => {
        if (calendarRef.current) {
            calendarRef.current.getApi().next();
            setCurrentDate(calendarRef.current.getApi().getDate());
        }
    };

    const renderEventContent = (eventInfo) => {
        return (
            <div>
                <b>{eventInfo.event.title}</b>
                <br/>
                <i>{eventInfo.timeText}</i>
            </div>
        );
    };

    const generatePlaylistTooltip = (videos) => {
        return videos.map((video, index) => `• ${video.title} (${video.duration}s)`).join('\n');
    };

    return (
        <div className="w-full p-4 relative">
            {/* Header */}
            <h1 className={"text-center text-4xl"}>Calendar preview (simulation)</h1>
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevWeek} className="p-2">
                    <ArrowLeft className="h-6 w-6 text-gray-500"/>
                </button>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select start date and time:</label>
                    <input
                        type="datetime-local"
                        className="border p-2 rounded-lg"
                        value={startDateTime || ""}
                        onChange={(e) => setStartDateTime(e.target.value)}
                    />
                </div>
                <button onClick={handleNextWeek} className="p-2">
                    <ArrowRight className="h-6 w-6 text-gray-500"/>
                </button>
            </div>

            {/* FullCalendar Component */}
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={locale}
                events={calendarEvents}
                nowIndicator={true}
                selectable={true}
                editable={false}
                timeZone="UTC+2"
                firstDay={1}
                height={'auto'}
                dayHeaderFormat={{ weekday: 'long', day: 'numeric' }}
                eventContent={renderEventContent}
                eventDidMount={(info) => {
                    info.el.style.overflow = 'hidden';
                    info.el.style.maxHeight = '100%';
                    const { title, start, end, extendedProps } = info.event;
                    let tooltipContent = `Title: ${title}\nStart: ${start}\nEnd: ${end}`;

                    // Si c'est une playlist, ajouter la liste des vidéos au tooltip
                    if (extendedProps.type === 'playlist' && extendedProps.videos) {
                        tooltipContent += `\nVideos:\n${generatePlaylistTooltip(extendedProps.videos)}`;
                    }

                    // Ajoute un tooltip natif
                    info.el.setAttribute('title', tooltipContent);
                }}
            />
        </div>
    );
};
