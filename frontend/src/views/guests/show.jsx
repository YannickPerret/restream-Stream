'use client'

import React from 'react';
import {useGuestStore} from "#stores/useGuestStore.js";

export default function GuestShowView() {
    const guest = useGuestStore.use.selectedGuest()

    if (!guest) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-4">
                <h3 className="text-xl">Email: {guest.email}</h3>
            </div>
            <div className="mb-4">
                <h4 className="text-xl">Display Name: {guest.displayName}</h4>
            </div>
            <div className="mb-4">
                <h4 className="text-xl">Discord Username: {guest.discordUsername}</h4>
            </div>
            <div className="mb-4">
                <h4 className="text-xl">Steam Username: {guest.steamUsername}</h4>
            </div>
            <div className="mb-4">
                <h4 className="text-xl">Twitch Username: {guest.twitchUsername}</h4>
            </div>
            <div className="mb-4">
                <h4 className="text-xl">Twitter(X) Username: {guest.twitterUsername}</h4>
            </div>
            <div className="mb-4">
                <h4 className="text-xl">Youtube Username: {guest.youtubeUsername}</h4>
            </div>
            <div className="mb-4">
                <h4 className="text-xl">Telegram Username: {guest.telegramUsername}</h4>
            </div>

            <div className="mt-4">
                <h4 className="text-xl">
                    Can diffuse: {guest.canDiffuse ? "Yes" : "No"}
                </h4>
            </div>

            <div className="mt-4">
                <h4 className="text-xl">
                    Notes: {guest.notes}
                </h4>
            </div>
        </div>
    );
}
