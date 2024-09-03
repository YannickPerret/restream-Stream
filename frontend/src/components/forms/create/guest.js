'use client';
import React, { useState } from 'react';
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";

export default function GuestForm({onSubmit}) {
    const [guest, setGuest] = useState({
        email: '',
        displayName: '',
        discordUsername: '',
        steamUsername: '',
        twitchUsername: '',
        twitterUsername: '',
        youtubeUsername: '',
        telegramUsername: '',
        canDiffuse: true,
    });

    const handleChange = (e) => {
        setGuest({ ...guest, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        setGuest({ ...guest, [e.target.name]: e.target.checked });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(guest);
    };

    return (
        <Form onSubmit={handleSubmit} className="space-y-4">
            <FormGroup title="Guest informations">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    name="email"
                    value={guest.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300"
                />

                <label htmlFor="displayName">Display Name:</label>
                <input
                    type="text"
                    name="displayName"
                    value={guest.displayName}
                    onChange={handleChange}
                    placeholder="Display Name"

                />
            </FormGroup>
            <FormGroup title="Social Networks">
                <label htmlFor="discordUsername">Discord Username:</label>
                <input
                    type="text"
                    name="discordUsername"
                    value={guest.discordUsername}
                    onChange={handleChange}
                    placeholder="Discord Username"

                />

                <label htmlFor="steamUsername">Steam Username:</label>
                <input
                    type="text"
                    name="steamUsername"
                    value={guest.steamUsername}
                    onChange={handleChange}
                    placeholder="Steam Username"
                />

                <label htmlFor="twitchUsername">Twitch Username:</label>
                <input
                    type="text"
                    name="twitchUsername"
                    value={guest.twitchUsername}
                    onChange={handleChange}
                    placeholder="Twitch Username"
                />

                <label htmlFor="twitterUsername">Twitter Username:</label>
                <input
                    type="text"
                    name="twitterUsername"
                    value={guest.twitterUsername}
                    onChange={handleChange}
                    placeholder="Twitter Username"
                />

                <label htmlFor="youtubeUsername">Youtube Username:</label>
                <input
                    type="text"
                    name="youtubeUsername"
                    value={guest.youtubeUsername}
                    onChange={handleChange}
                    placeholder="Youtube Username"
                />

                <label htmlFor="telegramUsername">Telegram Username:</label>
                <input
                    type="text"
                    name="telegramUsername"
                    value={guest.telegramUsername}
                    onChange={handleChange}
                    placeholder="Telegram Username"
                />
            </FormGroup>

            <FormGroup title="Permissions" type={"row"}>
                <label htmlFor="canDiffuse">Can Diffuse:</label>
                <input
                    type="checkbox"
                    name="canDiffuse"
                    checked={guest.canDiffuse}
                    onChange={handleCheckboxChange}
                    required={true}
                />
            </FormGroup>

            <FormGroup title="Validations" type={"row"}>
                <button className="btn btn-error" type="reset">Reset</button>
                <button className="btn btn-success" type="submit">Create Guest</button>
            </FormGroup>
        </Form>
    );
};
