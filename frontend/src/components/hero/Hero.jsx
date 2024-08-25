import React from 'react';
import Image from 'next/image';
import sampleScreen from '#public/hero_preview.png';
import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-gray-900 to-black text-white py-16 md:py-32">
            {/* Fond quadrillé */}
            <div className="absolute inset-0 bg-[url('/public/path-to-grid-image.png')] bg-center bg-contain opacity-10 pointer-events-none"></div>

            {/* Contenu principal */}
            <div className="relative container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
                {/* Texte et bouton */}
                <div className="flex flex-col items-start max-w-lg space-y-6">
                    <span className="inline-block bg-purple-800 text-purple-200 rounded-full px-3 py-1 text-sm font-semibold">
                        What's new
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Stream when you're offline and Maximize Your Reach !
                    </h1>
                    <p className="text-lg text-gray-300">
                        Stream live, then keep your audience engaged with continuous reruns on your Twitch channel. Connect your YouTube, Twitch, Facebook, and TikTok accounts, and let our automated system handle your schedules. Grow your audience, increase ad revenue, and never miss an opportunity to gain new subscribers all while expanding your reach 24/7.
                    </p>
                    <div className="flex space-x-4">
                        <Link href={"/auth/register"} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg no-underline">
                            Request your access
                        </Link>
                        <Link href={"/#features"} className="bg-transparent border border-gray-700 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-lg">
                            Learn more →
                        </Link>
                    </div>
                </div>

                {/* Image de droite */}
                <div className="mt-12 md:mt-0 rounded ">
                    <Image
                        src={sampleScreen}
                        alt="App Screenshot"
                        className="rounded-lg shadow-lg border-slate-700 border"
                        width={800}
                        height={400}
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
