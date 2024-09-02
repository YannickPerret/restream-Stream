'use client';

import { useEffect } from 'react';
import { isTokenExpired } from "#libs/auth";
import {useSessionStore} from "#stores/useSessionStore.js";

export default function ClientTokenChecker() {
    const { session, logout } = useSessionStore()

    useEffect(() => {
        if (session && isTokenExpired(session.token)) {
            logout();
        }
    }, [session, logout]);

    return null;
}
