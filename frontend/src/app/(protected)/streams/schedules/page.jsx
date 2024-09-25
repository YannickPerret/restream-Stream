'use client';
import React, { useEffect } from 'react';
import Table from '#components/table/Table';
import useStreamScheduleStore from "#stores/useStreamScheduleStore.js";
import Link from "next/link";

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
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Stream Schedule</h1>
                    <Link href="/streams/schedules/create">
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Add New Stream Schedule
                        </button>
                    </Link>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>

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
            </div>
        </section>
    );
};

export default ScheduleIndexPage;
