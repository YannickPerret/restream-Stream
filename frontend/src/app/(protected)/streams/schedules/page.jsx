'use client';
import React, { useEffect } from 'react';
import Table from '#components/table/Table';
import useStreamScheduleStore from "#stores/useStreamScheduleStore.js";
import Link from "next/link";
import Panel from "#components/layout/panel/Panel.jsx";

const ScheduleIndexPage = () => {
    const { streamSchedules, loading, fetchSchedules} = useStreamScheduleStore()

    // Charger les schedules de streams
    useEffect(() => {
        fetchSchedules()
    }, []);

    // Colonnes pour la table
    const columns = [
        { key: 'streamTitle', title: 'Stream Title' },
        { key: 'startTime', title: 'Start Time' },
        { key: 'endTime', title: 'End Time' },
        { key: 'status', title: 'Status' },
        { key: 'actions', title: 'Actions' }
    ];

    return (
        <Panel title="Stream Schedule" className="p-6" darkMode={true} breadcrumbPath={[
            { label: 'Home', href: '/' },
            { label: 'streams', href: '/streams' },
            { label: 'Schedules', href: '/streams/schedules' },
        ]} buttonLabel={'Add New Stream Schedule'} buttonLink={'/streams/schedules/create'}>
                    {loading ? (
                        <p className="text-center text-white">Loading...</p>
                    ) : streamSchedules.length === 0 ? (
                        <p className="text-center text-white">No schedules found.</p>
                    ) : (
                        <Table
                            columns={columns}
                            data={streamSchedules.map((schedule) => ({
                                streamTitle: schedule.stream.name,
                                startTime: new Date(schedule.startTime).toLocaleString(),
                                endTime: new Date(schedule.endTime).toLocaleString(),
                                status: schedule.status
                            }))}
                            darkMode={true}
                        />
                    )}
        </Panel>
    );
};

export default ScheduleIndexPage;
