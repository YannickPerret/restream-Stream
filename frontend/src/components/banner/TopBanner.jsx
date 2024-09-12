// frontend/src/components/banner/TopBanner.jsx
'use client'
import React, { useState } from 'react';
import Link from 'next/link';

const TopBanner = ({ message, linkText, linkUrl }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300 text-gray-900 shadow-lg p-3 z-50 flex justify-center items-center">
            <span className="text-center flex items-center">
                {message}{' '}
                <Link href={linkUrl} className="underline hover:text-gray-800 text-gray-700 ml-2">
                    {linkText}
                </Link>
            </span>
            <button
                className="absolute right-4 text-gray-600 hover:text-gray-900"
                onClick={() => setIsVisible(false)}>
                &times;
            </button>
        </div>
    );
};

export default TopBanner;
