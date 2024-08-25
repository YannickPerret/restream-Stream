import Link from "next/link.js";
import {LayoutDashboardIcon, LogIn, UserPlus} from "lucide-react";
import LogoutForm from "#components/forms/logout.jsx";
import {useSessionStore} from "#stores/useSessionStore.js";

export const NavigationRight = () => {
    const {isAuthenticated} = useSessionStore()


    return (
        isAuthenticated() ? (
            <div className="flex items-center">
                <Link href={'/dashboard'} aria-label="Dashboard">
                    <LayoutDashboardIcon className="text-gray-300 hover:text-white" />
                </Link>
                <LogoutForm />
            </div>
        ) : (
            <>
                <Link href="/auth/login" className="text-gray-400 no-underline hover:text-white">
                    <LogIn className="inline-block mr-2" /> Login
                </Link>

                <Link href="/auth/register" className="text-gray-400 no-underline hover:text-white"><UserPlus className="inline-block mr-2" /> Register</Link>
            </>

        )

    )
}