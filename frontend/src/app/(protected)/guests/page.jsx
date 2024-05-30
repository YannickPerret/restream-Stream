'use client'
import {useEffect} from "react";
import {GuestApi} from "#api/guest.js";
import {useGuestStore} from "#stores/useGuestStore.js";
import GuestIndexView from "@/views/guests/index.js";
import {useRouter} from "next/navigation";
import {useProviderStore} from "#stores/useProviderStore.js";

export default function GuestIndexPage() {
    const removeGuest = useGuestStore.use.deleteGuestById();
    const updateGuest = useGuestStore.use.updateGuestById();
    const getGuests = useGuestStore.use.fetchGuests()

    useEffect(() => {
        const fetchGuests = async () => {
            await getGuests();
        }
        fetchGuests();
    }, []);

    const handleRemove = async (id) => {
        await removeGuest(id);
    };

    const handleRevok = async (id, revok) => {
        const formdata = new FormData();
        formdata.append('canDiffuse', revok ? 1 : 0);
        await updateGuest(id, formdata)
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">All the Guest</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </header>

                <GuestIndexView
                    remove={handleRemove}
                    revok={handleRevok}
                />
            </div>
        </section>
    )
}