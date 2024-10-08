'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import {Home, Users, Folder, Calendar, FileText, Video, SubscriptIcon, TvIcon} from 'lucide-react';
import { useAuthStore } from '#stores/useAuthStore.js';

const navItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: Home,
        condition: () => true,
    },
    {
        href: '/streams',
        label: 'Streams',
        icon: TvIcon,
        condition: () => true,
    },
    {
        href: '/providers',
        label: 'Providers',
        icon: Users,
        condition: () => true,
    },
    {
        href: '/timelines',
        label: 'Timelines',
        icon: Calendar,
        condition: () => true,
    },
    {
        href: '/playlists',
        label: 'Playlists',
        icon: Folder,
        condition: () => true,
    },
    {
        href: '/videos',
        label: 'Videos',
        icon: Video,
        condition: () => true,
    },
    {
        href: '/orders',
        label: 'Orders',
        icon: FileText,
        condition: () => true,
    },
    {
        href: '/subscriptions',
        label: 'Subscriptions',
        icon: FileText,
        condition: () => true,
    },
    {
        href: '/admin/products',
        label: 'Manage products',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
    },
    {
        href: '/admin/orders',
        label: 'Manage orders',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
    },
    {
        href: '/admin/subscriptions',
        label: 'Manage subscriptions',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
    },
    {
        href: '/admin/discounts',
        label: 'Manage discounts',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
    },
    {
        href: '/admin/users',
        label: 'Manage users',
        icon: FileText,
        condition: (user) => user?.role?.name === 'admin',
    },

];

const SideNavigation = () => {
    const pathname = usePathname();
    const {user} = useAuthStore();

    return (
        <aside className="w-44 self-center ml-4 my-8 mb-8">
            <nav className="flex flex-col space-y-8 w-full bg-gray-900 py-6 rounded-lg">
                {navItems.map((item) => {
                    if (!item.condition(user)) {
                        return null; // Skip rendering this item if condition is false
                    }
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center w-full px-4 py-2 text-gray-400 hover:text-white ${isActive ? 'bg-gray-800 text-white rounded-md' : ''}`}>
                            <Icon className="mr-3" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

export default SideNavigation;
