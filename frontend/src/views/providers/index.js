import {useProviderStore} from "#stores/useProviderStore";
import Link from "next/link";
import {useState} from "react";
import ProvidersEditView from "@/views/providers/edit.jsx";


export default function ProviderIndex() {
    const providers = useProviderStore.use.providers()
    const deleteById = useProviderStore.use.deleteProviderById()
    const [selectedProvider, setSelectedProvider] = useState(null);


    if (!providers) {
        return <div>Loading...</div>
    }

    const handleDelete = async (id) => {
        await deleteById(id)
    }

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {selectedProvider && (
                <ProvidersEditView
                    providerToEdit={selectedProvider}
                    onClose={() => setSelectedProvider(null)}
                />
            )}
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" >
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Stream Key</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {providers.map(provider => (
                        <tr key={provider.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <Link href={`/providers/${provider.id}`}>
                                    {provider.name}
                                </Link>
                            </th>
                            <td>{provider.type}</td>
                            <td>{provider.streamKey}</td>
                            <td>
                                <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => setSelectedProvider(provider)}>Edit</button>
                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" onClick={() => {handleDelete(provider.id)}}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}