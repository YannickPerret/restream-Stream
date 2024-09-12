// frontend/src/components/layout/header/Header.jsx
'use client'
import { useState, useEffect } from 'react';
import Logo from "#public/coffeeStream.png";
import Image from "next/image";
import Navigation from "#components/layout/navigation/Navigation.jsx";
import { NavigationRight } from "#components/layout/navigation/NavigationRight.jsx";
import { Menu, X } from "lucide-react"; // Icons for burger menu

const Header = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setAuthChecked(true);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="absolute top-0 left-0 w-full z-30 text-white border-b-2 border-gray-50 border-opacity-10 bg-transparent">
            <div className="container mx-auto flex justify-between items-center px-4 py-3 bg-transparent">
                <div className="flex items-center">
                    <Image
                        src={Logo}
                        alt="Coffee Stream"
                        width={240}
                        height={80}
                        className="object-contain"
                    />
                </div>

                {/* Centered Navigation for larger screens */}
                <div className="hidden md:flex flex-1 justify-center">
                    <Navigation />
                </div>

                {/* Right-aligned elements for larger screens */}
                <div className="hidden md:flex items-center space-x-4 ml-auto">
                    {authChecked && <NavigationRight />}
                </div>

                {/* Burger menu for mobile screens */}
                <div className="md:hidden flex items-center ml-auto">
                    <button onClick={toggleMobileMenu} aria-label="Toggle menu">
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile sidebar menu */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-gray-400 transform ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out z-50 md:hidden`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <Image
                        src={Logo}
                        alt="Coffee Stream"
                        width={180}
                        height={60}
                        className="object-contain"
                    />
                    <button onClick={toggleMobileMenu} aria-label="Close menu">
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
                <nav className="flex flex-col space-y-4 p-4">
                    <Navigation />
                </nav>
                <div className="border-t border-gray-700 p-4 mt-auto">
                    {authChecked && <NavigationRight />}
                </div>
            </div>

            {/* Overlay for closing the sidebar when clicking outside */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
                    onClick={toggleMobileMenu}
                ></div>
            )}
        </header>
    );
};

export default Header;
