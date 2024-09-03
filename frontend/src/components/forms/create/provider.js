'use client';
import { useState, useEffect } from "react";
import { useProviderStore } from "#stores/useProviderStore";
import { ProviderApi } from "#api/provider";
import TwitchLoginButton from "#components/Twitch/TwitchLoginButton";
import { useRouter } from 'next/navigation';

export default function ProvidersCreateForm() {
    const [providerType, setProviderType] = useState("");
    const router = useRouter();

    const handleTwitchSuccess = () => {
        router.push('/providers/create/callback');
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <label className="block mb-4">
                <span className="text-gray-700">Provider Type</span>
                <select className="mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300" value={providerType} onChange={(e) => setProviderType(e.target.value)}>
                    <option disabled value="">Select an option</option>
                    <option value="Twitch">Twitch</option>
                    <option value="YouTube" disabled>YouTube</option>
                    <option value="Facebook" disabled>Facebook</option>
                </select>
            </label>

            {providerType === "Twitch" && (
                <TwitchLoginButton onSuccess={handleTwitchSuccess} />
            )}
        </div>
    );
}
