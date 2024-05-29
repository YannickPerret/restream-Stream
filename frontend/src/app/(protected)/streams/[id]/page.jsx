'use client'
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {useStreamStore} from "#stores/useStreamStore.js";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import StreamsShowView from "@/views/streams/show.js";
import {StreamApi} from "#api/stream.js";
import transmit from "#libs/transmit.js";
import StreamsEditView from "@/views/streams/edit.jsx";

export default function StreamShowPage() {
    const { id } = useParams();
    const fetchStream = useStreamStore.use.fetchStreamById()
    const updateCurrentVideo = useStreamStore.use.updateCurrentVideo()
    const updateStreamSelectedStatus = useStreamStore.use.updateStreamSelectedStatus();
    const [subscription, setSubscription] = useState(null)
    const stream = useStreamStore.use.selectedStream()
    const [selectedStream, setSelectedStream] = useState(null);


    useEffect(() => {
        const getStream = async () => {
            await fetchStream(id)
        }
        getStream()
    }, [id]);

    useEffect(() => {
        const createSubscriptions = async () => {
            if (stream){
                const sub = transmit.subscription(`streams/${stream.id}/currentVideo`);
                await sub.create();
                setSubscription(sub);

                if (stream.status === 'active') {
                    subscription.onMessage(({currentVideo}) => {
                        updateCurrentVideo(stream.id, currentVideo);
                    });
                }
            }
        };

        createSubscriptions();

    }, [stream]);

    const handleStart = async (id) => {
        subscription.onMessage(({ currentVideo }) => {
            console.log('currentVideo', currentVideo);
            updateCurrentVideo(id, currentVideo);
        });

        await StreamApi.start(id).then(async () => {
            updateStreamSelectedStatus('active')
        });
    };

    const handleStop = async (id) => {
        await StreamApi.stop(id).then(async () => {
            updateStreamSelectedStatus('inactive')
        });
    };

    const handleRestart = async (id) => {
        await StreamApi.restart(id);
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            {selectedStream && (
                <StreamsEditView
                    streamToEdit={selectedStream}
                    onClose={() => setSelectedStream(null)}
                />
            )}
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Show Stream Information</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/streams"} className={"flex"}><ArrowLeft />&nbsp; Back to Streams</Link>
                    </div>
                    <div>
                        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => setSelectedStream(stream)}>Edit
                        </button>
                    </div>
                </header>

                <StreamsShowView
                    handleStart={handleStart}
                    handleStop={handleStop}
                    handleRestart={handleRestart}
                />
            </div>
        </section>
    )
}