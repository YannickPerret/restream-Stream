'use client'
import {useEffect} from "react";
import {useGuestStore} from "#stores/useGuestStore.js";
import {useParams} from "next/navigation";
import {GuestApi} from "#api/guest.js";
import GuestShowView from "@/views/guests/show.jsx";

export default function GuestShowPage() {
    const setSelectedGuest = useGuestStore.use.setSelectedGuest();
    const findGuest = useGuestStore.use.findGuest();
    const params = useParams();


    useEffect(() => {
        const fetchGuest = async() => {
            if(params.id) {
                if (findGuest(params.id)) {
                    setSelectedGuest(params.id);
                }
                else
                {
                    const data = await GuestApi.getOne(params.id);
                    if(data) {
                        setSelectedGuest(data);
                    }
                    else {
                        console.log("Guest not found")
                    }
                }
            }
        }

        fetchGuest();
    }, [params]);

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