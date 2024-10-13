import React, { useState } from 'react';
import { Calendar, List } from 'lucide-react';
import {CalendarView} from "#components/timeline/view/TimelineCalendarView.jsx";
import TimelineListView from "#components/timeline/view/TimelineListView.jsx";
import TimelineSwitchLocal from "#components/timeline/switch/TimelineSwitchLocal.jsx";


const TimelineSwitcher = ({timeline, removeVideo, moveVideo }) => {
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
            <div className={"flex flex-row justify-between"}>
                <TimelineSwitchLocal />
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-white mb-4 text-center">Timeline View</h2>
                    <div className="flex space-x-4">
                        <button
                            onClick={switchToList}
                            className={`w-14 p-2 rounded-lg flex justify-center items-center ${view === 'list' ? 'bg-violet-600' : 'bg-gray-700'} hover:bg-violet-500 transition-all`}
                        >
                            <List size={24} className="text-white"/>
                        </button>
                        <button
                            onClick={switchToCalendar}
                            className={`w-14 p-2 rounded-lg flex justify-center items-center ${view === 'calendar' ? 'bg-violet-600' : 'bg-gray-700'} hover:bg-violet-500 transition-all`}
                        >
                            <Calendar size={24} className="text-white"/>
                        </button>
                    </div>
                </div>
            </div>
            {view === 'calendar' ? (
                <CalendarView/>
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
