'use client';
import React, { useState, useEffect } from 'react';
import Button from '#components/_forms/Button';
import InputCalendar from '#components/_forms/InputCalendar'; // Custom InputCalendar component
import Dropdown from '#components/_forms/Dropdown';
import { StreamScheduleApi } from '#api/streamSchedule.js';
import { useStreamStore } from '#stores/useStreamStore.js';
import { DateTime } from 'luxon'; // Import Luxon

const ScheduleCreatePage = () => {
    const [streamId, setStreamId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [recurrenceType, setRecurrenceType] = useState(null);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [timezone, setTimezone] = useState(''); // Store user's timezone
    const [loading, setLoading] = useState(false);
    const { streams, fetchStreams } = useStreamStore();

    // Fetch the streams and set default streamId
    useEffect(() => {
        const loadStreams = async () => {
            try {
                const fetchedStreams = await fetchStreams();
                if (fetchedStreams.length > 0 && !streamId) {
                    setStreamId(fetchedStreams[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch streams:', error);
            }
        };

        loadStreams();

        const userTimezone = DateTime.now().zoneName;
        setTimezone(userTimezone);
    }, [streamId, fetchStreams]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Convert startTime and endTime to UTC or the server's preferred format using Luxon
        const formattedStartTime = DateTime.fromISO(startTime, { zone: timezone }).toUTC().toISO();
        const formattedEndTime = DateTime.fromISO(endTime, { zone: timezone }).toUTC().toISO();

        const data = {
            streamId,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            recurrenceType,
            recurrenceEndDate,
            timezone,
        }

        console.log(data);

        try {
            await StreamScheduleApi.create(data);
            alert('Schedule created successfully!');
        } catch (error) {
            console.error('Failed to create schedule:', error);
            alert('Failed to create schedule.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Create a New Schedule</h1>
                </div>
                <hr className="border-b-1 border-blueGray-300 pb-6" />

                <div className="p-6">
                    <form onSubmit={handleSubmit}>

                        <Dropdown
                            label="Stream"
                            options={streams.map((stream) => ({
                                label: `${stream.name}, ${stream.provider.name}`,
                                value: stream.id.toString(), // Ensure value is a string for the Dropdown
                            }))}
                            value={streamId ? streamId.toString() : ''} // Convert to string for Dropdown
                            onChange={(e) => setStreamId(parseInt(e.target.value))} // Convert value back to number
                            required
                        />

                        <InputCalendar
                            label="Start Time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />

                        <InputCalendar
                            label="End Time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />

                        <Dropdown
                            label="Recurrence"
                            options={[
                                { label: 'None', value: null },
                                { label: 'Daily', value: 'daily' },
                                { label: 'Weekly', value: 'weekly' },
                                { label: 'Monthly', value: 'monthly' },
                                { label: 'Yearly', value: 'yearly' },
                            ]}
                            value={recurrenceType || ''}
                            onChange={(e) => setRecurrenceType(e.target.value)}
                        />

                        {recurrenceType && (
                            <InputCalendar
                                label="Recurrence End Date"
                                type="date"
                                value={recurrenceEndDate}
                                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                            />
                        )}

                        <div className="flex justify-end mt-6">
                            <Button label="Create Schedule" type="submit" color="blue" loading={loading} />
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ScheduleCreatePage;
