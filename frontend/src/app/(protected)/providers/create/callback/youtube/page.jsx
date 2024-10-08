'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Form from "#components/_forms/Form";
import FormGroup from "#components/_forms/FormGroup";
import Input from "#components/_forms/Input";
import Button from "#components/_forms/Button";
import Link from "next/link";
import {
    createLiveBroadcast,
    createLiveStream,
    getBroadcasts,
    fetchStreamKey,
    fetchToken,
    fetchStreamId,
    bindLiveStreamToBroadcast
} from "#helpers/youtube.js";
import { ProviderApi } from "#api/provider.js";

export default function ProvidersCreateYouTubeCallback() {
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState(process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || "");
    const [clientSecret, setClientSecret] = useState(process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_SECRET || "");
    const [refreshToken, setRefreshToken] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [streamKey, setStreamKey] = useState("");
    const [broadcasterId, setBroadcasterId] = useState("");
    const [broadcasts, setBroadcasts] = useState([]); // Liste des diffusions disponibles
    const router = useRouter();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');

        if (code) {
            const fetchTokens = async () => {
                try {
                    const data = await fetchToken(code);

                    const { access_token, refresh_token } = data;
                    setAccessToken(access_token);
                    setRefreshToken(refresh_token);

                    // Récupérer les diffusions disponibles
                    const broadcastsData = await getBroadcasts(access_token);

                    if (broadcastsData.items.length > 0) {
                        setBroadcasts(broadcastsData);
                    } else {
                        // Si aucune diffusion n'est disponible, proposer la création d'une nouvelle diffusion
                        const newBroadcast = await createLiveBroadcast(access_token, 'My New Live Stream');
                        setStreamKey(newBroadcast.cdn.ingestionInfo.streamName);
                        setBroadcasterId(newBroadcast.id);
                    }

                } catch (error) {
                    console.error('Failed to fetch tokens:', error.message);
                }
            };

            fetchTokens();
        } else {
            router.push('/providers/create');
        }
    }, [router]);

    const handleBroadcastSelection = async (broadcast) => {
        try {
            // Vérifier si un flux est déjà lié au broadcast
            const streamId = await fetchStreamId(accessToken, broadcast.id);

            if (streamId) {
                // Si un flux est déjà lié, récupérer la clé de flux
                const streamKey = await fetchStreamKey(accessToken, streamId);
                setStreamKey(streamKey);
                setBroadcasterId(broadcast.id);
                setBroadcasts([]); // Masquer la liste après la sélection
            } else {
                // Si aucun flux n'est lié, créer un nouveau flux et le lier
                const newStream = await createLiveBroadcast(accessToken, 'My New Live Stream');
                await bindLiveStreamToBroadcast(accessToken, broadcast.id, newStream.id);
                const streamKey = newStream.cdn.ingestionInfo.streamName;
                setStreamKey(streamKey);
                setBroadcasterId(broadcast.id);
            }
        } catch (error) {
            console.error('Error handling broadcast selection:', error.message);
        }
    };

    const handleNewStreamCreation = async () => {
        try {
            // Créer un nouveau flux (RTMP)
            const newStream = await createLiveStream(accessToken, `My New Live Stream : ${new Date().toISOString()}`);
            console.log("New Stream:", newStream);

            // Créer un nouveau broadcast (vidéo de diffusion en direct)
            const newBroadcast = await createLiveBroadcast(accessToken, 'My New Live Stream Video');
            console.log("New Broadcast:", newBroadcast);

            // Vérifiez que les IDs sont bien définis
            const streamId = newStream.id;
            const broadcastId = newBroadcast.id;
            if (!streamId || !broadcastId) {
                throw new Error('Stream ID or Broadcast ID is missing');
            }

            // Lier le flux au broadcast
            await bindLiveStreamToBroadcast(accessToken, broadcastId, streamId);

            // Récupérer la clé de flux
            const streamKey = newStream.cdn.ingestionInfo.streamName;

            // Mettre à jour les états
            setStreamKey(streamKey);
            setBroadcasterId(broadcastId);
            setBroadcasts([]); // Masquer la liste après la création d'un nouveau stream
        } catch (error) {
            console.error('Error creating new stream:', error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ProviderApi.create({
                providerType: "YouTube",
                name,
                clientId,
                clientSecret,
                refreshToken,
                authToken: accessToken,
                streamKey,
                broadcasterId,
            });

            router.push('/providers/create');
        } catch (error) {
            console.error('Failed to create provider:', error);
        }
    }

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">YouTube Provider Callback</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <Link href="/providers" className="text-white underline">Back to Providers</Link>
                </div>
                <div className="p-6">
                    {broadcasts.items?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {broadcasts.items.map((broadcast) => (
                                <div key={broadcast.id} className="card bg-white shadow-lg p-4 rounded-lg">
                                    <img src={broadcast.snippet.thumbnails.medium.url} alt={broadcast.snippet.title}
                                         className="w-full h-48 object-cover rounded-lg"/>
                                    <h2 className="text-xl font-bold mt-4">{broadcast.snippet.title}</h2>
                                    <p className="text-gray-600">Created
                                        at: {new Date(broadcast.snippet.publishedAt).toLocaleString()}</p>
                                    <Button onClick={() => handleBroadcastSelection(broadcast)}
                                            label="Select this broadcast"/>
                                </div>
                            ))}
                            <div className="mt-4">
                                <Button onClick={handleNewStreamCreation} label="Add a New Stream"/>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p>No active live broadcasts found. You can create a new one.</p>
                            <Button onClick={handleNewStreamCreation} label="Add a New Stream"/>
                        </div>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <FormGroup title="Provider Information">
                            <Input
                                label="Provider Name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name of provider"
                                required
                            />
                        </FormGroup>
                        <FormGroup title="Authentication Information">
                            <Input
                                label="Access Token"
                                type="text"
                                value={accessToken}
                                disabled
                            />
                            <Input
                                label="Broadcaster ID"
                                type="text"
                                value={broadcasterId}
                                disabled
                            />
                            <Input
                                label="Stream Key"
                                type="text"
                                value={streamKey}
                                disabled
                            />
                        </FormGroup>
                        <div className="flex justify-end space-x-4">
                            <Button type="reset" label={"Reset"}/>
                            <Button type="submit" label={"Create"}/>
                        </div>
                    </Form>
                </div>
            </div>
        </section>
    );
}
