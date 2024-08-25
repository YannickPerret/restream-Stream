import React from 'react';
import Image from 'next/image';

const Testimonial = ({ imageSrc, imageAlt, quote, author, role }) => {
    return (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-gray-900 text-white p-4 rounded-lg relative overflow-visible">
            <div className="flex flex-col lg:flex-row items-stretch relative">
                <div className="lg:w-1/2 relative">
                    <div className="absolute inset-0 lg:-inset-y-16">
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg object-cover"
                            style={{ borderRadius: '0.5rem' }}
                        />
                    </div>
                </div>
                <div className="flex-1 p-8 relative z-10 lg:ml-16">
                    <blockquote className="text-2xl lg:text-3xl font-semibold leading-relaxed">
                        <span className="text-6xl text-indigo-400 font-serif">&ldquo;</span>
                        {quote}
                        <span className="text-6xl text-indigo-400 font-serif">&rdquo;</span>
                    </blockquote>
                    <p className="mt-4 text-lg font-bold">{author}</p>
                    <p className="text-gray-400">{role}</p>
                </div>
            </div>
        </div>
    );
};

export default Testimonial;
