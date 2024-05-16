'use client'
import {useEffect} from "react";
import {GuestApi} from "#api/guest.js";
import {useGuestStore} from "#stores/useGuestStore.js";
import GuestIndexView from "@/views/guests/index.js";
import {useRouter} from "next/navigation";

export default function GuestIndexPage() {
    const router = useRouter();
    const guests = useGuestStore(state => state.guests);
    const setGuests = useGuestStore(state => state.setGuests);
    const removeGuest = useGuestStore(state => state.removeGuest);
    const updateGuest = useGuestStore(state => state.updateGuest);

    useEffect(() => {
        const fetchGuests = async () => {
            await GuestApi.getAll().then((data) => {
                setGuests(data);
            })
        }
        fetchGuests();
    }, [setGuests]);

    const handleRemove = async (id) => {
        await GuestApi.delete(id).then(() => {
            removeGuest(id);
        });
    };

    const handleEdit = async (id) => {
        router.push(`/guests/${id}/edit`);
    };

    const handleRevok = async (id, revok) => {
        await GuestApi.update(id, {canDiffuse: revok}).then((data) => {
            updateGuest(data);
        });
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
                    edit={handleEdit}
                    revok={handleRevok}
                />
            </div>
        </section>
    )
}