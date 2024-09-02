'use client';
import React from 'react';

const TwitchLoginButton = () => {
    const handleLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
        if (!clientId) {
            console.error('Twitch Client ID is not defined');
            return;
        }

        const redirectUri = encodeURIComponent(`${window.location.origin}/providers/create/callback/twitch`);
        const scope = encodeURIComponent("user:read:email channel:read:stream_key channel:manage:broadcast");

        const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
        console.log('Redirecting to:', authUrl);

        window.location.href = authUrl;
    };

    return (
        <button type="button" onClick={handleLogin} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center">
            <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.285 0l-4.285 4.286v15.428h6v4.286h4.286l4.286-4.286h3.429l6-6v-13.714zm17.142 11.429l-2.572 2.571h-3.429l-4.286 4.286v-4.286h-5.143v-9.714h15.429zm-10.714 3.429h2.857v-7.143h-2.857zm6 0h2.857v-7.143h-2.857z"/>
            </svg>
            Login with Twitch
        </button>
    );
};

export default TwitchLoginButton;