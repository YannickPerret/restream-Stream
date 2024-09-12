import React from 'react';
import Image from 'next/image';
import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="relative h-screen w-full flex flex-col justify-center items-center text-center bg-cover bg-no-repeat bg-center"
                 style={{ backgroundImage: "url('/hero_background.svg')" }}>

            {/* Texte du Hero */}
            <div className="z-10 max-w-6xl mx-auto">
                <span className="inline-block bg-purple-800 text-purple-200 rounded-full px-3 py-1 text-sm font-semibold mb-4">
                    What's new
                </span>
                <h1 className="text-6xlxl md:text-7xl font-bold text-white">
                    Stream When You're Offline & Maximize Your Reach!
                </h1>
                <p className="text-lg text-gray-300 mt-4">
                    Turn your content into a revenue machine! Schedule your VODs to stream on multiple platforms even when offline. Upgrade to premium plans to broadcast on multiple channels simultaneously. Our high-availability servers ensure your replays keep running smoothly, allowing you to earn subscriptions, donations, and ad revenue around the clock.
                </p>
                <div className="flex space-x-4 justify-center mt-8">
                    <Link href={"/auth/register"} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded no-underline">
                        Start Earning Now
                    </Link>
                    <Link href={"/#features"} className="bg-transparent border border-gray-700 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded">
                        Learn more →
                    </Link>
                </div>
            </div>

            {/* Icône de gauche */}
            <Image
                src="/hero_left_icone.svg"
                alt="Left Icon"
                width={80}
                height={80}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-0"
            />

            {/* Icône de droite */}
            <Image
                src="/hero_right_icone.svg"
                alt="Right Icon"
                width={80}
                height={80}
                className="absolute right-0 top-2/3 transform -translate-y-1/2 z-0"
            />
        </section>
    );
};

export default HeroSection;
