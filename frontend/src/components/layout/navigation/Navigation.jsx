// frontend/src/components/layout/navigation/Navigation.jsx
'use client';
import Link from "next/link";
import { useState, useRef } from "react";
import SubMainMenu from "./SubMainMenu";

export default function Navigation() {
    const [isLaunchesOpen, setIsLaunchesOpen] = useState(false);
    const timeoutRef = useRef(null);

    // Items du sous-menu
    const subMenuItems = [
        {
            label: "Coming Soon",
            link: "/launches/coming-soon",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-3 3h3m-3 3h3m-3 3h3M3 3v18h18V3H3z" />
                </svg>
            ),
            iconBg: "bg-green-100"
        },
        {
            label: "Launch Archive",
            link: "/launches/archive",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75L9 16.5l9-9" />
                </svg>
            ),
            iconBg: "bg-red-100"
        },
        {
            label: "Launch Guide",
            link: "/launches/guide",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M3 9h18m-9 4.5h9m-18 4.5h18" />
                </svg>
            ),
            iconBg: "bg-blue-100"
        },
    ];

    // Fonction pour ouvrir le sous-menu
    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsLaunchesOpen(true);
    };

    // Fonction pour fermer le sous-menu avec un délai
    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsLaunchesOpen(false);
        }, 300); // Délai de 300ms avant de fermer le sous-menu
    };

    return (
        <nav className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0 relative">
            <SubMainMenu
                items={subMenuItems}
                isOpen={isLaunchesOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            <Link href="/" className="text-gray-400 hover:text-white">
                Home
            </Link>
            <Link href="/#features" className="text-gray-400 hover:text-white">
                Features
            </Link>
            <Link href="/#pricing" className="text-gray-400 hover:text-white">
                Pricing
            </Link>
            <Link href="/#review" className="text-gray-400 hover:text-white">
                Review
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact
            </Link>
        </nav>
    );
}
