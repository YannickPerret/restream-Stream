'use client';

import { Transmit } from '@adonisjs/transmit-client';

let transmit = null;

if (typeof window !== 'undefined') {
    transmit = new Transmit({
        baseUrl: 'http://localhost:3333',
        maxReconnectAttempts: 5,
        onSubscription: (channel) => {
            console.log(`Subscription connected to ${channel}`);
        },

        onSubscribeFailed: (error) => {
            console.error("Subscription error:", error);
        },
    });
}

export default transmit;
