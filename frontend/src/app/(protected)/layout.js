"use client";
import { useAuthStore } from "#stores/useAuthStore.js";
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import SideNavigation from "#components/layout/navigation/SideNavigation.jsx";

export default function RootLayout({ children, error }) {
    const { isAuthenticated, isLoggedIn } = useAuthStore();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (!isLoggedIn()) {
            redirect('/auth/login');
        } else {
            setAuthChecked(true);
        }
    }, []);

    if (!authChecked) {
        return null;
    }

    return (
        <div className="flex flex-row w-full mt-32" style={{background:'rgb(241 245 249 )'}}>
            <SideNavigation />
            <div className="flex flex-col flex-grow justify-start items-center w-full">
                <div className="w-full p-6 rounded h-auto text-black">
                    {children}
                </div>
            </div>
        </div>
    );
}
