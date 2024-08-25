"use client";
import { useSessionStore } from "#stores/useSessionStore";
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react';
import SideNavigation from "#components/layout/navigation/SideNavigation.jsx";

export default function RootLayout({ children, error }) {
    const { isAuthenticated } = useSessionStore();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            redirect('/login')
        } else {
            setAuthChecked(true);
        }
    }, [isAuthenticated]);

    if (!authChecked) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-row w-full h-screen">
            <SideNavigation />
            <div className="flex flex-col justify-center items-center w-full">
                <div className="w-full max-w-4xl p-6 rounded h-auto text-black">
                    {children}
                </div>
            </div>
        </div>
    );
}
