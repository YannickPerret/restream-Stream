'use client';
import { useEffect } from 'react';
import { useStreamStore } from "#stores/useStreamStore";
import StreamPageIndex from '@/views/streams';
import Link from "next/link.js";

const StreamsPage = () => {
    const getStreams = useStreamStore.use.fetchStreams();

    useEffect(() => {
        const fetchStreams = async () => {
            await getStreams();
        };
        fetchStreams();
    }, [getStreams]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl p-8 bg-gradient-to-r from-indigo-900 via-gray-900 to-black">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Streams</h1>
                    <Link href="/streams/create">
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Create New Stream
                        </button>
                    </Link>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>
                <StreamPageIndex/>
            </div>
        </section>
    );
};

export default StreamsPage;
