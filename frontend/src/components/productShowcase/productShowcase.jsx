import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ProductShowcase = () => {
    return (
        <section className="py-16 bg-gray-900 text-white">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">

                {/* Texte à gauche */}
                <div className="flex flex-col items-start max-w-lg space-y-6">
                    <h2 className="text-sm text-purple-800 uppercase tracking-wide">Product features</h2>
                    <h1 className="text-4xl md:text-5xl font-bold">
                        What is CoffeeStream?
                    </h1>
                    <p className="text-lg text-gray-400">
                        CoffeeStream is your platform to stream content even while you're offline. Enjoy automated scheduling of your VODs across platforms like Twitch, YouTube, and Facebook. Reach more viewers, more easily.
                        <br />
                        With high-availability servers, you can earn revenue through subscriptions and ad placements all day, every day. Upgrade to access even more advanced features like multi-channel streaming and non-blocking schema changes.
                    </p>
                    <div className="flex space-x-4">
                        <Link href={"/auth/register"} className="bg-purple-800 hover:bg-purple-600 text-purple-200 font-semibold py-3 px-6 rounded-lg no-underline">
                            Sign up
                        </Link>
                        <Link href={"/contact"} className="bg-transparent border border-gray-700 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-lg">
                            Contact us →
                        </Link>
                    </div>
                </div>

                {/* Image à droite avec bloc blanc décalé */}
                <div className="relative mt-12 md:mt-0">
                    {/* Bloc blanc en arrière-plan */}
                    <div className="absolute bg-purple-800 w-5/6 h-full -right-12 -bottom-8 rounded-lg shadow-lg"></div>
                    <Image
                        src="/phoenix.jpg" // Utilisation de ton image
                        alt="Product Screenshot"
                        className="relative rounded-lg shadow-lg border-r border-b border-black "
                        width={800}
                        height={400}
                    />
                </div>
            </div>

            {/* Caractéristiques en bas */}
            <div className="mt-36 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center space-y-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 0a2 2 0 100-4H5a2 2 0 100 4h6m-6 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold">Familiar workflows</h3>
                    <p className="text-gray-400">Manage your streams like you manage your code.</p>
                </div>

                {/* Bar vertical ajoutée ici */}
                <div className="flex flex-col items-center space-y-4 border-l border-gray-600 pl-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c0-1.664-1.336-3-3-3s-3 1.336-3 3 1.336 3 3 3 3-1.336 3-3zm0 0c0 1.664 1.336 3 3 3s3-1.336 3-3-1.336-3-3-3-3 1.336-3 3z" />
                    </svg>
                    <h3 className="text-xl font-bold">No compromises</h3>
                    <p className="text-gray-400">Scale without sacrificing performance.</p>
                </div>

                <div className="flex flex-col items-center space-y-4 border-l border-gray-600 pl-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c0-1.664-1.336-3-3-3s-3 1.336-3 3 1.336 3 3 3 3-1.336 3-3-1.336-3-3-3 1.336-3 3z" />
                    </svg>
                    <h3 className="text-xl font-bold">Read-only regions</h3>
                    <p className="text-gray-400">Globally distributed application support.</p>
                </div>

                <div className="flex flex-col items-center space-y-4 border-l border-gray-600 pl-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 0a2 2 0 100-4H5a2 2 0 100 4h6m-6 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold">Zero downtime imports</h3>
                    <p className="text-gray-400">Seamlessly migrate without downtime.</p>
                </div>
            </div>
        </section>
    );
};

export default ProductShowcase;
