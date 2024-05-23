'use client';

import { Transmit } from '@adonisjs/transmit-client';

let transmit = null;

if (typeof window !== 'undefined') {
    transmit = new Transmit({
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        maxReconnectAttempts: 5,
        onSubscribeFailed: (error) => {
            console.error("Subscription error:", error);
        },
    });
}

export default transmit;
