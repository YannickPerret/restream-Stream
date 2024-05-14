'use client';
import { useState } from "react";
import {ProviderApi} from "../../../api/provider";

export default function ProvidersCreateForm() {
    const [providerType, setProviderType] = useState("");
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [broadcasterId, setBroadcasterId] = useState("");
    const [authToken, setAuthToken] = useState("");
    const [streamKey, setStreamKey] = useState("");

    const resetForm = () => {
        setProviderType("");
        setName("");
        setClientId("");
        setClientSecret("");
        setRefreshToken("");
        setBroadcasterId("");
        setAuthToken("");
        setStreamKey("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await ProviderApi.create({
            providerType,
            name,
            clientId,
            clientSecret,
            refreshToken,
            broadcasterId,
            authToken,
            streamKey
        }).then((response) => {
            console.log(response);
            resetForm();
        }).catch((error) => {
            console.log(error);
        })
    }

    return (
        <form className="space-y-4 border-2" onSubmit={handleSubmit}>
            <label className="block">
                <span className="text-gray-700">Provider Type</span>
                <select className="mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300" value={providerType} onChange={(e) => setProviderType(e.target.value)}>
                    <option disabled={true} value="">Select an option</option>
                    <option value="Twitch">Twitch</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                </select>
            </label>

            {providerType !== "" && (
                <>
                    <label className="flex flex-col">
                        <span className="text-gray-700">Title</span>
                        <input type="text" name="name" placeholder="Name of providers" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300" />
                    </label>

                    {providerType === "Twitch" && (
                        <>
                            <label className="flex flex-col">
                                <span className="text-gray-700">Client ID</span>
                                <input type="text" name="clientId" placeholder="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300" />
                            </label>
                            <label className="flex flex-col">
                                <span className="text-gray-700">Client Secret</span>
                                <input type="text" name="clientSecret" placeholder="Client Secret" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
                            </label>
                            <label className="flex flex-col">
                                <span className="text-gray-700">Refresh Token</span>
                                <input type="text" name="refreshToken" placeholder="Refresh Token" value={refreshToken} onChange={(e) => setRefreshToken(e.target.value)} />
                            </label>
                            <label className="flex flex-col">
                                <span className="text-gray-700">Broadcaster Id</span>
                                <input type="text" name="broadcasterId" placeholder="Broadcaster ID" value={broadcasterId} onChange={(e) => setBroadcasterId(e.target.value)} />
                            </label>

                            <label className="flex flex-col">
                                <span className="text-gray-700">Auth Token</span>
                                <input type="text" name="auth_token" placeholder="Auth Token" value={authToken} onChange={(e) => setAuthToken(e.target.value)} />
                            </label>
                            <label className="flex flex-col">
                                <span className="text-gray-700">Stream Key</span>
                                <input type="text" name="stream_key" placeholder="Stream Key" value={streamKey} onChange={(e) => setStreamKey(e.target.value)} />
                            </label>
                        </>
                    )}
                    <button type="submit" className="border-2 border-black">Create</button>
                </>
            )}
        </form>
    )
}

