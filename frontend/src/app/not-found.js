'use client'
import Link from "next/link";
import Image from 'next/image';

export default function NotFound() {
    return (
        <section className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            {/* Image ou Icône d'erreur */}
            <div className="mb-8">
                <Image
                    src="/icones/error_icon.svg"  // Remplace avec ton icône ou image
                    alt="Error Icon"
                    width={150}
                    height={150}
                    className="mx-auto"
                />
            </div>

            {/* Message d'erreur */}
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <h2 className="text-3xl font-semibold mb-2">Page Not Found</h2>
                <p className="text-lg text-gray-400 mb-8">
                    Oops! The page you're looking for doesn't exist or an error occurred.
                </p>

                {/* Bouton pour revenir à l'accueil */}
                <Link href="/" className="inline-block px-8 py-3 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 transition duration-300 ease-in-out">
                    Return Home
                </Link>
            </div>
        </section>
    );
}
