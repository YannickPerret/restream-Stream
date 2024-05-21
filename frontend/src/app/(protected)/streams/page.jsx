'use client';
import { StreamApi } from '#api/stream';
import StreamPageIndex from '@/views/streams';
import { useEffect } from 'react';
import {useStreamStore} from "#stores/useStreamStore";

const StreamsPage = () => {

    useEffect(() => {
        const fetchStreams = async () => {
            const data = await StreamApi.getAll();
            useStreamStore.setState({streams: data.streams});
        };
        fetchStreams();
    }, []);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Streams</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </header>
                <StreamPageIndex/>
            </div>
        </section>
    );
};

export default StreamsPage;
