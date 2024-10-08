'use client';
import {useEffect, useState} from 'react';
import { useStreamStore } from "#stores/useStreamStore";
import StreamPageIndex from '@/views/streams';
import Link from "next/link.js";
import {useAuthStore} from "#stores/useAuthStore";
import AuthApi from "#api/auth.js";

const StreamsPage = () => {
    const {fetchStreams} = useStreamStore();
    const {setSubscriptions, setUser, user } = useAuthStore()
    const [maxStreamInstance, setMaxStreamInstance] = useState(0);
    const [currentStreamCount, setCurrentStreamCount] = useState(0);

    useEffect(() => {
        const _fetchStreams = async () => {
            const data = await fetchStreams();

            setCurrentStreamCount(data.length);
        };

        const _fetchUserData = async () => {
            await AuthApi.getCurrentUser().then((data) => {
                setUser(data.user)
                // Récupérer les souscriptions
                setSubscriptions(data.subscriptions);

                // Chercher la feature 'max_stream_instance' dans la première souscription
                const maxStreamFeature = data.subscriptions[0]?.features?.find(
                    (feature) => feature.name === 'max_stream_instances'
                );

                // S'assurer que la feature et sa valeur existent
                if (maxStreamFeature && maxStreamFeature.values && maxStreamFeature.values.length > 0) {
                    setMaxStreamInstance(maxStreamFeature.values[0]);
                } else {
                    setMaxStreamInstance(0);
                }
            })
            .catch((e) => {
                console.error(e)
            })
        };


        _fetchStreams();
        _fetchUserData()

    }, [fetchStreams]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">
                        Streams {currentStreamCount} / {maxStreamInstance}
                        {maxStreamInstance > 0 && (
                            <Link href="/subscriptions/upgrade" className="text-lg ml-4">Upgrade offers</Link>
                        )}
                    </h1>

                    {maxStreamInstance > 0 ? (
                        <>
                            <Link href="/streams/create">
                                <button
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
                                    disabled={currentStreamCount >= maxStreamInstance}>
                                    Create New Stream
                                </button>
                            </Link>
                            {currentStreamCount >= maxStreamInstance && (
                                <div className="text-red-500 ml-4">
                                    Max stream instances reached, please remove one or upgrade your plan.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-white">
                            You don't have an active offer, <Link href="/shops/products" className="underline">Buy
                            here</Link>.
                        </div>
                    )}
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>
                <StreamPageIndex/>
            </div>
        </section>
    );
};

export default StreamsPage;
