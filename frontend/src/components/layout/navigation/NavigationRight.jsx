// frontend/src/components/layout/navigation/NavigationRight.jsx
import Link from "next/link.js";
import { LayoutDashboardIcon, LogIn, UserPlus } from "lucide-react";
import LogoutForm from "#components/forms/logout.jsx";
import { useAuthStore } from "#stores/useAuthStore.js";

export const NavigationRight = () => {
    const { isLoggedIn } = useAuthStore();

    return (
        isLoggedIn() ? (
            // Flex direction is row for desktop and column for mobile (below md breakpoint)
            <div className="flex flex-col md:flex-row md:items-center">
                <Link
                    href={'/dashboard'}
                    aria-label="Dashboard"
                    className="flex flex-row items-center gap-2 text-white bg-purple-600 rounded-lg px-4 py-2 ml-0 md:ml-4 mb-4 md:mb-0 hover:bg-purple-700 transition-all duration-300 no-underline"
                >
                    <LayoutDashboardIcon className="text-gray-300 hover:text-white" /> Dashboard
                </Link>
                <LogoutForm />
            </div>
        ) : (
            // Flex direction is column for mobile, row for desktop
            <div className="flex flex-col md:flex-row">
                <Link
                    href="/auth/login"
                    className="no-underline text-white bg-sky-700 rounded-lg px-4 py-2 mb-4 md:mb-0 md:mr-4 hover:bg-sky-800 transition-all duration-300"
                >
                    <LogIn className="inline-block mr-2" /> Login
                </Link>

                <Link
                    href="/auth/register"
                    className="no-underline text-white bg-purple-600 rounded-lg px-4 py-2 hover:bg-purple-700 transition-all duration-300"
                >
                    <UserPlus className="inline-block mr-2" /> Register
                </Link>
            </div>
        )
    );
}
