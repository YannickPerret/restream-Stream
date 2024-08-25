import React from 'react';

const TrustLogos = () => {
    const logos = [
        { name: "Transistor", src: "https://placehold.co/840x240", alt: "Transistor logo" },
        { name: "Reform", src: "https://placehold.co/840x240", alt: "Reform logo" },
        { name: "Tuple", src: "https://placehold.co/840x240", alt: "Tuple logo" },
        { name: "Laravel", src: "https://placehold.co/840x240", alt: "Laravel logo" },
        { name: "SavvyCal", src: "https://placehold.co/840x240", alt: "SavvyCal logo" },
        { name: "Statamic", src: "https://placehold.co/840x240", alt: "Statamic logo" },
    ];

    return (
        <div className="bg-gray-900 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-w-6xl mx-auto">
                {logos.map((logo, index) => (
                    <div
                        key={index}
                        className="flex justify-center items-center bg-gray-800 p-6 rounded-lg shadow-lg"
                    >
                        <img src={logo.src} alt={logo.alt} className="h-12" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrustLogos;
