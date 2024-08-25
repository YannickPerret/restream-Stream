'use client';
import Link from "next/link";

import {
    Home,
    LogIn,
    Users,
} from "lucide-react";

export default function Navigation() {

    return (
        <nav className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0">
            <Link href="/" className="text-gray-400 hover:text-white">
                <Home className="inline-block mr-2" /> Home
            </Link>
            <Link href="/#features" className="text-gray-400 hover:text-white">
                <Home className="inline-block mr-2" /> features
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white">
                <Home className="inline-block mr-2" /> Price
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white">
                <Home className="inline-block mr-2" /> Review
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white">
                <Home className="inline-block mr-2" /> Contact
            </Link>
        </nav>
    );
}
