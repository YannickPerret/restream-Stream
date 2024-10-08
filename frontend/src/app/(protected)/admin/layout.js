"use client";
import { useAuthStore } from "#stores/useAuthStore.js";
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import SideNavigation from "#components/layout/navigation/SideNavigation.jsx";

export default function AdminLayout({ children }) {
    const { isLoggedIn, isAdmin } = useAuthStore();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (!isLoggedIn()) {
            // Redirect to login if not logged in
            redirect('/auth/login');
        } else if (!isAdmin()) {
            // Redirect to dashboard if not an admin
            redirect('/dashboard');
        } else {
            setAuthChecked(true);
        }
    }, [isLoggedIn, isAdmin]);

    if (!authChecked) {
        return null; // Prevent rendering until auth is checked
    }

    return (
        children
    );
}
