import React from 'react';
import Image from "next/image";
import twitch from '#public/twitch.png';
import youtube from '#public/youtube.png';
import meta from '#public/meta.svg';
import twitter from '#public/twitter.png';
import tiktok from '#public/tiktok.png';
import kick from '#public/kick.png';

const TrustLogos = () => {
    const logos = [
        { name: "Twitch", src: twitch, alt: "Twitch logo" },
        { name: "Youtube", src: youtube, alt: "Youtube logo" },
        { name: "Tiktok", src: tiktok, alt: "Tiktok logo" },
        { name: "Meta", src: meta, alt: "Meta logo" },
        { name: "Kick", src: kick, alt: "Kick logo" },
        { name: "X exTwitter", src: twitter, alt: "X exTwitter logo", isLarge: true },
    ];

    return (
        <div className="bg-gray-900 py-8 pb-32">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl font-bold text-white mb-6">We are available on</h1>
                <p className="text-lg text-gray-300 mb-6">We provide seamless, real-time broadcasting of your content
                    across all of these platforms.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {logos.map((logo, index) => (
                        <div
                            key={index}
                            className="flex justify-center items-center bg-gray-800 rounded-lg shadow-lg h-36"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={logo.isLarge ? 70 : 160}  // Adjust the width for larger logos
                                height={logo.isLarge ? 70 : 160} // Adjust the height for larger logos
                                className="object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustLogos;
