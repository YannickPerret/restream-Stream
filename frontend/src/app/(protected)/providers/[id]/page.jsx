'use client'
import {ArrowLeft} from "lucide-react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {useProviderStore} from "#stores/useProviderStore";
import {useEffect, useState} from "react";
import ProvidersShowView from "@/views/providers/show.jsx";
import StreamsEditView from "@/views/streams/edit.jsx";
import ProvidersEditView from "@/views/providers/edit.jsx";
import Breadcrumb from "#components/breadcrumb/Breadcrumb.jsx";

export default function ProvidersShowPage() {
    const getProvider = useProviderStore.use.fetchProviderById()
    const [selectedProvider, setSelectedProvider] = useState(null)
    const provider = useProviderStore.use.selectedProvider()
    const { id } = useParams();


    useEffect(() => {
        const fetchProvider = async() => {
            if(id) {
                await getProvider(id);
            }
        }
        fetchProvider();
    }, [id]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <Breadcrumb
                paths={[
                    { label: 'Providers', href: '/providers' },
                    { label: 'Show Provider Information', href: '/providers/[id]' }
                ]} />

            {selectedProvider && (
                <ProvidersEditView
                    providerToEdit={selectedProvider}
                    onClose={() => setSelectedProvider(null)}
                />
            )}
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Show Provider Information</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/providers"} className={"flex"}><ArrowLeft/>&nbsp; Back to Providers</Link>
                    </div>

                    <div>
                        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => setSelectedProvider(provider)}>Edit
                        </button>
                    </div>
                </header>

                <ProvidersShowView/>
            </div>
        </section>
    )
}