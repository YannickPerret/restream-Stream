'use client'
import {useEffect} from "react";
import {GuestApi} from "#api/guest.js";
import {useGuestStore} from "#stores/useGuestStore.js";
import GuestIndexView from "@/views/guests/index.js";

export default function GuestIndexPage() {

    useEffect(() => {
        const fetchGuests = async () => {
            await GuestApi.getAll().then((data) => {
                useGuestStore.setState({guests: data});
            })
        }
        fetchGuests();
    }, []);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">All the Guest</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </header>

                <GuestIndexView/>
            </div>
        </section>
    )
}