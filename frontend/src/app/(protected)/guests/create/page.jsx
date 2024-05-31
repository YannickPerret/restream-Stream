'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import PlaylistForm from "#components/forms/create/playlist.js";
import { PlaylistApi } from "#api/playlist";
import { useVideoStore } from "#stores/useVideoStore";
import { VideoApi } from "#api/video";
import DraggableList from '#components/draggable/Draggable';
import {useGuestStore} from "#stores/useGuestStore.js";
import {GuestApi} from "#api/guest.js";
import GuestForm from "#components/forms/create/guest.js";

export default function GuestCreatePage() {
    const [guest, setGuest] = useState({
        email: '',
        displayName: '',
        discordUsername: '',
        steamUsername: '',
        twitchUsername: '',
        youtubeUsername: '',
        twitterUsername: '',
        telegramUsername: '',
        canDiffuse: true,
        notes: '',
    });


    const submitGuest = async (guestForm) => {
        console.log('submitting guest', guestForm);
        await GuestApi.create(guestForm).then((response) => {
            if (response.ok) {
                console.log('Guest created successfully');
                setGuest({
                    email: '',
                    displayName: '',
                    discordUsername: '',
                    steamUsername: '',
                    twitchUsername: '',
                    youtubeUsername: '',
                    twitterUsername: '',
                    telegramUsername: '',
                    canDiffuse: true,
                    notes: '',
                });
            }
            else {
                console.log('Error creating guest', response);
            }
        });
    };


    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4 ">Create a new Guest</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />
                    <div>
                        <Link href={"/guests"}>Back to Guest</Link>
                    </div>
                </header>

                <div className="flex flex-row">
                    <GuestForm onSubmit={submitGuest} />
                </div>
            </div>
        </section>
    );
}
