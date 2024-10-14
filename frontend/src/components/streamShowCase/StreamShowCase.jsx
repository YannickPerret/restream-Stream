'use client'
import React, { useEffect, useRef, useState } from 'react';
import Link from "next/link";

const StreamShowCase = () => {
    const [isStream1Visible, setIsStream1Visible] = useState(false);
    const [isStream2Visible, setIsStream2Visible] = useState(false);

    const stream1Ref = useRef(null);
    const stream2Ref = useRef(null);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.25,
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.target === stream1Ref.current) {
                    setIsStream1Visible(entry.isIntersecting);
                } else if (entry.target === stream2Ref.current) {
                    setIsStream2Visible(entry.isIntersecting);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        if (stream1Ref.current) observer.observe(stream1Ref.current);
        if (stream2Ref.current) observer.observe(stream2Ref.current);

        return () => {
            if (stream1Ref.current) observer.unobserve(stream1Ref.current);
            if (stream2Ref.current) observer.unobserve(stream2Ref.current);
        };
    }, []);

    return (
        <div className="container mx-auto px-6 gap-4">
            {/* Titre de la section */}
            <div className="flex flex-col gap-4 text-center mb-12 text-white">
                <h2 className="text-sm text-sky-600 uppercase tracking-wide">Discover Our Services</h2>
                <h3 className="text-4xl md:text-5xl font-bold">Streaming Solutions for Every Need</h3>
                <p className="mt-4 text-lg">
                    Explore our diverse range of services to help you reach your audience, automate your content, and engage viewers on any platform.
                </p>
            </div>

            {/* Vidéos intégrées côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Premier stream embed */}
                <div ref={stream1Ref} className="w-full mx-auto h-[378px]">
                    {isStream1Visible ? (
                        <>
                            <iframe
                                src="https://player.twitch.tv/?channel=beyondspeedruns_fr&parent=localhost&autoplay=true&mute=true"
                                frameBorder="0"
                                allowFullScreen="true"
                                scrolling="no"
                                height="378"
                                width="620"
                                className="mx-auto"
                            ></iframe>
                            <span className="block text-center mt-2 italic text-gray-700">
                                Stream from <Link href={'https://www.twitch.tv/beyondspeedruns_fr'} alt={`Stream provenant de BeyondSpeedruns_FR`} className={"text-gray-700"}>BeyondSpeedruns_FR</Link>
                            </span>
                        </>
                    ) : (
                        <div className="h-[378px]"></div>
                    )}
                </div>

                {/* Deuxième stream embed */}
                <div ref={stream2Ref} className="w-full mx-auto h-[378px]">
                    {isStream2Visible ? (
                        <>
                            <iframe
                                src="https://player.twitch.tv/?channel=arcana_stream&parent=localhost&autoplay=true&mute=true"
                                frameBorder="0"
                                allowFullScreen="true"
                                scrolling="no"
                                height="378"
                                width="620"
                                className="mx-auto"
                            ></iframe>
                            <span className="block text-center mt-2 italic text-gray-700">
                                Stream from <Link href={"https://www.twitch.tv/arcana_stream"} alt={"Stream provenant de Arcana_Stream"} className={"text-gray-700"}>Arcana_Stream</Link>
                            </span>
                        </>
                    ) : (
                        <div className="h-[378px]"></div>
                    )}
                </div>
            </div>

            {/* Texte explicatif en bas */}
            <div className="mt-12 text-center">
                <p className="text-lg">
                    Our platform enables seamless multistreaming to multiple channels such as Twitch, YouTube, and more.
                    With fully automated video scheduling, you can focus on creating content while we ensure your videos
                    reach the right audience at the right time.
                </p>
            </div>
        </div>
    );
};

export default StreamShowCase;
