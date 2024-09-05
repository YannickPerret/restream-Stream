import React, { useState } from 'react';
import { Calendar, List } from 'lucide-react';
import CalendarView from "#components/timeline/view/TimelineCalendarView.jsx";
import TimelineListView from "#components/timeline/view/TimelineListView.jsx";


const TimelineSwitcher = ({timeline, removeVideo, moveVideo, locale }) => {
    const [view, setView] = useState('list'); // Default view

    const switchToCalendar = () => {
        console.log('Switching to calendar view');
        setView('calendar');
    };

    const switchToList = () => {
        console.log('Switching to list view');
        setView('list');
    };


    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-end mb-4 gap-4">
                <button
                    onClick={switchToList}
                    className={`ml-2 p-2 rounded-full ${view === 'list' ? 'bg-indigo-600' : 'bg-gray-700'} hover:bg-indigo-500 transition-all`}>
                    <List size={24} className="text-white"/>
                </button>
                <button
                    onClick={switchToCalendar}
                    className={`p-2 rounded-full ${view === 'calendar' ? 'bg-indigo-600' : 'bg-gray-700'} hover:bg-indigo-500 transition-all`}>
                    <Calendar size={24} className="text-white"/>
                </button>
            </div>

            {view === 'calendar' ? (
                <CalendarView locale={locale} />
            ) : (
                <TimelineListView
                    timeline={timeline}
                    removeVideo={removeVideo}
                    moveVideo={moveVideo}
                />
            )}
        </div>
    );
};

export default TimelineSwitcher;
