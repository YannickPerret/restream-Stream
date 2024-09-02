'use client'
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useStreamStore } from "#stores/useStreamStore.js";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StreamsShowView from "@/views/streams/show.js";
import { StreamApi } from "#api/stream.js";
import transmit from "#libs/transmit.js";
import StreamsEditView from "@/views/streams/edit.jsx";
import Button from "@/components/_forms/Button.jsx";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function StreamShowPage() {
    const { id } = useParams();
    const fetchStream = useStreamStore.use.fetchStreamById();
    const updateCurrentVideo = useStreamStore.use.updateCurrentVideo();
    const updateStreamSelectedStatus = useStreamStore.use.updateStreamSelectedStatus();
    const [subscription, setSubscription] = useState(null);
    const stream = useStreamStore.use.selectedStream();
    const [selectedStream, setSelectedStream] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    // References for charts
    const bitrateChartRef = useRef(null);
    const cpuChartRef = useRef(null);
    const memoryChartRef = useRef(null);

    useEffect(() => {
        const getStream = async () => {
            await fetchStream(id);
        };
        getStream();
    }, [id]);

    useEffect(() => {
        const createSubscriptions = async () => {
            if (stream) {
                const sub = transmit.subscription(`streams/${stream.id}/currentVideo`);
                const streamAnalytics = transmit.subscription(`streams/${stream.id}/analytics`);

                await sub.create();
                setSubscription(sub);
                await streamAnalytics.create();

                if (stream.status === 'active') {
                    streamAnalytics.onMessage(({ stats }) => {
                        updateCharts(stats);
                    });
                }
            }
        };

        createSubscriptions();
    }, [stream]);

    const updateCharts = (stats) => {
        if (!stats) return;

        const { bitrate, cpu, memory, network } = stats;

        if (bitrateChartRef.current) {
            const bitrateData = bitrateChartRef.current.data;
            const currentTime = new Date().toLocaleTimeString();

            // Mettre à jour les labels (axes x)
            bitrateData.labels.push(currentTime);

            // Mettre à jour les datasets (axes y)
            bitrateData.datasets[0].data.push(bitrate);           // Bitrate
            bitrateData.datasets[1].data.push(network.input);     // Input (réseau)
            bitrateData.datasets[2].data.push(network.output);    // Output (réseau)

            bitrateChartRef.current.update();
        }

        if (cpuChartRef.current) {
            const cpuData = cpuChartRef.current.data;
            cpuData.labels.push(new Date().toLocaleTimeString());
            cpuData.datasets[0].data.push(cpu);
            cpuChartRef.current.update();
        }

        if (memoryChartRef.current) {
            const memoryData = memoryChartRef.current.data;
            memoryData.labels.push(new Date().toLocaleTimeString());
            memoryData.datasets[0].data.push(memory);
            memoryChartRef.current.update();
        }
    };

    const handleStart = async (id) => {
        subscription.onMessage(({ currentVideo }) => {
            if (currentVideo) {
                updateCurrentVideo(id, currentVideo);
            }
        });

        await StreamApi.start(id).then(async () => {
            updateStreamSelectedStatus('active');
        });
    };

    const handleStop = async (id) => {
        await StreamApi.stop(id).then(async () => {
            updateStreamSelectedStatus('inactive');
        });
    };

    const handleRestart = async (id) => {
        await StreamApi.restart(id);
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl shadow-2xl bg-gray-900">
            {selectedStream && (
                <StreamsEditView
                    streamToEdit={selectedStream}
                    onClose={() => setSelectedStream(null)}
                />
            )}
            <header className="bg-gray-800 text-white p-6 rounded-t-2xl">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-semibold">Stream Information</h1>
                        <Link href={"/streams"} className="flex items-center mt-2 text-sm text-gray-300 hover:text-white">
                            <ArrowLeft className="w-4 h-4" />&nbsp; Back to Streams
                        </Link>
                    </div>
                    <Button label="Edit" onClick={() => setSelectedStream(stream)} />
                </div>
            </header>

            <StreamsShowView
                handleStart={handleStart}
                handleStop={handleStop}
                handleRestart={handleRestart}
            />

            <div className="mt-8 p-6 bg-gray-100 rounded-b-2xl">
                <h2 className="text-2xl font-semibold mb-4">Stream Analytics</h2>
                <div id="visualization-container" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CPU Usage Chart */}
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">CPU Usage (%)</h3>
                        <Line
                            ref={cpuChartRef}
                            data={{
                                labels: [],
                                datasets: [{
                                    label: 'CPU Usage (%)',
                                    data: [],
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 2,
                                    fill: false,
                                }]
                            }}
                            options={{
                                scales: {
                                    x: { display: true },
                                    y: { display: true, min: 0, max: 100 }
                                }
                            }}
                        />
                    </div>

                    {/* Memory Usage Chart */}
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">Memory Usage (GB)</h3>
                        <Line
                            ref={memoryChartRef}
                            data={{
                                labels: [],
                                datasets: [{
                                    label: 'Memory Usage (GB)',
                                    data: [],
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 2,
                                    fill: false,
                                }]
                            }}
                            options={{
                                scales: {
                                    x: { display: true },
                                    y: { display: true, min: 0 }
                                }
                            }}
                        />
                    </div>

                    {/* Bitrate Chart */}
                    <div className="bg-white shadow-lg rounded-lg p-4 col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Network Usage</h3>
                        <Line
                            ref={bitrateChartRef}
                            data={{
                                labels: [],
                                datasets: [
                                    {
                                        label: 'Bitrate (kbps)',
                                        data: [],
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        borderWidth: 2,
                                        fill: false,
                                    },
                                    {
                                        label: 'Network Input (bytes)',
                                        data: [],
                                        borderColor: 'rgba(255, 99, 132, 1)',
                                        borderWidth: 2,
                                        fill: false,
                                    },
                                    {
                                        label: 'Network Output (bytes)',
                                        data: [],
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        borderWidth: 2,
                                        fill: false,
                                    },
                                ]
                            }}
                            options={{
                                scales: {
                                    x: { display: true },
                                    y: { display: true, min: 0 }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
