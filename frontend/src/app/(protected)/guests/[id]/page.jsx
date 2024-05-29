'use client'
import {useEffect} from "react";
import {useGuestStore} from "#stores/useGuestStore.js";
import {useParams} from "next/navigation";
import {GuestApi} from "#api/guest.js";
import GuestShowView from "@/views/guests/show.jsx";

export default function GuestShowPage() {
    const setSelectedGuest = useGuestStore.use.setSelectedGuest();
    const getProvider = useGuestStore.use.fetchGuestById();
    const {id} = useParams();

    useEffect(() => {
        const fetchGuest = async() => {
            if(id) {
                await getProvider(id);
            }
        }
        fetchGuest();
    }, [id]);


    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Show Guest Information</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </header>


                <GuestShowView/>
            </div>
        </section>
    )
}