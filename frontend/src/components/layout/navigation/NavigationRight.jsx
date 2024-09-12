// frontend/src/components/layout/navigation/NavigationRight.jsx
import Link from "next/link.js";
import {LayoutDashboardIcon, LogIn, UserPlus} from "lucide-react";
import LogoutForm from "#components/forms/logout.jsx";
import {useAuthStore} from "#stores/useAuthStore.js";

export const NavigationRight = () => {
    const {isLoggedIn} = useAuthStore()

    return (
        isLoggedIn() ? (
            <div className="flex items-center">
                <Link href={'/dashboard'} aria-label="Dashboard" className="flex flex-row  gap-2 text-white bg-purple-600 rounded-lg px-4 py-2 ml-4 hover:bg-purple-700 transition-all duration-300 no-underline">
                    <LayoutDashboardIcon className="text-gray-300 hover:text-white" /> Dashboard
                </Link>
                <LogoutForm />
            </div>
        ) : (
            <>
                <Link href="/auth/login" className="text-white border border-white rounded-lg px-4 py-2 hover:bg-white hover:text-black transition-all duration-300">
                    <LogIn className="inline-block mr-2" /> Login
                </Link>

                <Link href="/auth/register" className="text-white bg-purple-600 rounded-lg px-4 py-2 ml-4 hover:bg-purple-700 transition-all duration-300">
                    <UserPlus className="inline-block mr-2" /> Register
                </Link>
            </>

        )

    )
}
