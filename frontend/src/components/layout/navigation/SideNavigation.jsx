'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import {Home, Users, Folder, Calendar, FileText, Video, SubscriptIcon, TvIcon} from 'lucide-react';
import { useAuthStore } from '#stores/useAuthStore.js';
import {useState} from "react";
import {CirclePlus} from "lucide-react";

const navItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: Home,
        condition: () => true,
        subItems: [],
    },
    {
        href: '/streams',
        label: 'Streams',
        icon: TvIcon,
        condition: () => true,
        subItems: [  // Sous-menu pour Streams
            { href: '/streams/create', label: 'Create Streams', icon: <CirclePlus /> },
            { href: '/streams/schedules', label: 'Scheduled Streams' },
        ],
    },
    {
        href: '/providers',
        label: 'Providers',
        icon: Users,
        condition: () => true,
        subItems: [
            { href: '/providers/create', label: 'Create Providers', icon: <CirclePlus /> },
        ],
    },
    {
        href: '/timelines',
        label: 'Timelines',
        icon: Calendar,
        condition: () => true,
        subItems: [
            { href: '/timelines/create', label: 'Create Timelines', icon: <CirclePlus /> },
        ],
    },
    {
        href: '/playlists',
        label: 'Playlists',
        icon: Folder,
        condition: () => true,
        subItems: [
            { href: '/playlists/create', label: 'Create Playlists', icon: <CirclePlus /> },
        ],
    },
    {
        href: '/videos',
        label: 'Videos',
        icon: Video,
        condition: () => true,
        subItems: [
            { href: '/videos/create', label: 'Upload new Videos', icon: <CirclePlus /> },
        ],
    },
    {
        href: '/orders',
        label: 'Orders',
        icon: FileText,
        condition: () => true,
        subItems: [],
    },
    {
        href: '/subscriptions',
        label: 'Subscriptions',
        icon: FileText,
        condition: () => true,
        subItems: [],
    },
    {
        href: '/admin/products',
        label: 'Manage products',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
        subItems: [],
    },
    {
        href: '/admin/orders',
        label: 'Manage orders',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
        subItems: [],
    },
    {
        href: '/admin/subscriptions',
        label: 'Manage subscriptions',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
        subItems: [],
    },
    {
        href: '/admin/discounts',
        label: 'Manage discounts',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
        subItems: [],
    },
    {
        href: '/admin/users',
        label: 'Manage users',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
        subItems: [],
    },

];

const SideNavigation = () => {
    const pathname = usePathname();
    const {user} = useAuthStore();
    const [openSubMenu, setOpenSubMenu] = useState(null);

    return (
        <aside className="w-44 self-center ml-4 my-8 mb-8">
            <nav className="flex flex-col space-y-8 w-full bg-gray-900 py-6 rounded-lg">
                {navItems.map((item) => {
                    if (!item.condition(user)) {
                        return null;
                    }
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <div
                            key={item.href}
                            className="relative group"
                            onMouseEnter={() => setOpenSubMenu(item.href)}
                            onMouseLeave={() => setOpenSubMenu(null)}
                        >
                            <Link
                                href={item.href}
                                className={`flex items-center w-full px-4 py-2 text-gray-400 hover:text-white ${isActive ? 'bg-gray-800 text-white rounded-md' : ''}`}>
                                <Icon className="mr-3" />
                                {item.label}
                            </Link>

                            {/* Sous-menu */}
                            {item.subItems && item.subItems.length > 0 && (
                                <div
                                    className={`absolute left-full top-0 mt-0.5 ml-0 bg-gray-800 rounded-md shadow-lg w-48 transition-opacity duration-200 ease-in-out ${
                                        openSubMenu === item.href ? 'opacity-100 visible' : 'opacity-0 invisible'
                                    } z-50`}
                                >
                                    {item.subItems.map((subItem) => (
                                        <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            className="flex flex-row gap-1 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700">
                                            {subItem.icon && subItem.icon} {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default SideNavigation;
