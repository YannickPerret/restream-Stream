'use client';

import { useEffect } from "react";
import { useProviderStore } from "#stores/useProviderStore";
import ProviderIndex from "@/views/providers";
import Link from "next/link";

export default function ProvidersPage() {
    const getProviders = useProviderStore.use.fetchProviders();

    useEffect(() => {
        const fetchProviders = async () => {
            await getProviders();
        };
        fetchProviders();
    }, [getProviders]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Providers</h1>
                    <Link href="/providers/create">
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Add New Provider
                        </button>
                    </Link>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>
                <ProviderIndex/>
            </div>
        </section>
    );
}
