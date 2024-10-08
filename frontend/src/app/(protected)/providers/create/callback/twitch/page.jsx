// frontend/src/app/(protected)/providers/create/callback/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useProviderStore } from "#stores/useProviderStore";
import { ProviderApi } from "#api/provider";
import { useRouter } from 'next/navigation';
import Form from "#components/_forms/Form";
import FormGroup from "#components/_forms/FormGroup";
import Input from "#components/_forms/Input";
import Button from "#components/_forms/Button";
import Link from "next/link";

export default function ProvidersCreateCallback() {
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState(process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "");
    const [clientSecret, setClientSecret] = useState(process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET || "");
    const [refreshToken, setRefreshToken] = useState("");
    const [broadcasterId, setBroadcasterId] = useState("");
    const [authToken, setAuthToken] = useState("");
    const [streamKey, setStreamKey] = useState("");

    const { tokens, setTokens } = useProviderStore(state => ({
        tokens: state.tokens,
        setTokens: state.setTokens
    }));

    const router = useRouter();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');

        if (code) {
            const fetchTokens = async () => {
                try {
                    const response = await fetch('https://id.twitch.tv/oauth2/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            'grant_type': 'authorization_code',
                            'client_id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
                            'client_secret': process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET,
                            code,
                            'redirect_uri': `${window.location.origin}/providers/create/callback/twitch`,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`${errorData.message}`);
                    }

                    const data = await response.json();
                    const { access_token, refresh_token } = data;

                    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
                        },
                    });

                    if (!userResponse.ok) {
                        const errorData = await userResponse.json();
                        throw new Error(`Failed to fetch user data: ${errorData.message}`);
                    }

                    const userData = await userResponse.json();
                    const broadcaster_id = userData.data[0]?.id;

                    const streamKeyResponse = await fetch(`https://api.twitch.tv/helix/streams/key?broadcaster_id=${broadcaster_id}`, {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
                        },
                    });

                    if (!streamKeyResponse.ok) {
                        const errorData = await streamKeyResponse.json();
                        throw new Error(`Failed to fetch stream key: ${errorData.message}`);
                    }

                    const streamKeyData = await streamKeyResponse.json();
                    const stream_key = streamKeyData.data[0]?.stream_key;

                    setTokens({
                        access_token,
                        refresh_token,
                        broadcaster_id,
                        stream_key,
                    });

                    setAuthToken(access_token);
                    setRefreshToken(refresh_token);
                    setBroadcasterId(broadcaster_id);
                    setStreamKey(stream_key);

                } catch (error) {
                    console.error('Failed to fetch tokens:', error.message);
                }
            };

            fetchTokens();
        }

    }, [router, setTokens]);

    useEffect(() => {
        if (tokens) {
            setAuthToken(tokens.access_token);
            setRefreshToken(tokens.refresh_token);
            setBroadcasterId(tokens.broadcaster_id);
            setStreamKey(tokens.stream_key);
            setTokens(null); // Reset tokens after using them
        }
    }, [tokens, setTokens]);

    const resetForm = () => {
        setName("");
        setClientId("");
        setClientSecret("");
        setRefreshToken("");
        setBroadcasterId("");
        setAuthToken("");
        setStreamKey("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Submitting provider data:', {
                providerType: "Twitch",
                name,
                clientId,
                clientSecret,
                refreshToken,
                broadcasterId,
                authToken,
                streamKey
            });

            const response = await ProviderApi.create({
                providerType: "Twitch",
                name,
                clientId,
                clientSecret,
                refreshToken,
                broadcasterId,
                authToken,
                streamKey
            });

            console.log('Provider created:', response);
            resetForm();
            router.push('/providers/create'); // Redirection after creation
        } catch (error) {
            console.error('Failed to create provider:', error);
        }
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Twitch Provider Callback</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <Link href="/providers" className="text-white underline">Back to Providers</Link>
                </div>
                <div className="p-6">
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
                                value={authToken}
                                disabled
                            />
                            <Input
                                label="Refresh Token"
                                type="text"
                                value={refreshToken}
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
                            <Button type="reset" label={"Reset"} onClick={resetForm}/>
                            <Button type="submit" label={"Create"}/>
                        </div>
                    </Form>
                </div>
            </div>
        </section>
    );
}
