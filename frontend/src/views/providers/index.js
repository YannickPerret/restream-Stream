'use client';
import { useState } from "react";
import { useProviderStore } from "#stores/useProviderStore";
import Link from "next/link";
import Table from "#components/table/Table";
import ProvidersEditView from "@/views/providers/edit.jsx";

export default function ProviderIndex() {
    const providers = useProviderStore.use.providers();
    const deleteById = useProviderStore.use.deleteProviderById();
    const [selectedProvider, setSelectedProvider] = useState(null);

    if (!providers) {
        return <div>Loading...</div>;
    }

    const handleDelete = async (id) => {
        await deleteById(id);
    };

    const columns = [
        { title: "Name", key: "name", render: (text, provider) => <Link href={`/providers/${provider.id}`}>{text}</Link> },
        { title: "Type", key: "type" },
        { title: "Stream Key (encoded)", key: "streamKey", render: (streamKey) => streamKey.substring(0, 25) },
        {
            title: "Actions",
            key: "actions",
            render: (_, provider) => (
                <div className="flex space-x-4">
                    <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setSelectedProvider(provider)}>Edit
                    </button>
                    <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleDelete(provider.id)}>Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {selectedProvider && (
                <ProvidersEditView
                    providerToEdit={selectedProvider}
                    onClose={() => setSelectedProvider(null)}
                />
            )}
            <Table columns={columns} data={providers} />
        </div>
    );
}
