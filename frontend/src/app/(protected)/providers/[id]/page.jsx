'use client'
import {ArrowLeft} from "lucide-react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {useProviderStore} from "#stores/useProviderStore";
import {useEffect} from "react";
import ProvidersShowView from "@/views/providers/show.jsx";

export default function ProvidersShowPage() {
    const getProvider = useProviderStore.use.fetchProviderById()
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
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Show Provider Information</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/providers"} className={"flex"}><ArrowLeft />&nbsp; Back to Providers</Link>
                    </div>
                </header>

                <ProvidersShowView />
            </div>
        </section>
    )
}