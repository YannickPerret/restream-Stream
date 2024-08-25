'use client'
import React, { useState } from 'react';
// Importez le composant Link de next/link si vous voulez un lien dynamique entre les pages
import Link from 'next/link';

const TopBanner = ({ message, linkText, linkUrl }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="relative bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300 text-gray-900 rounded-lg p-2 shadow-lg flex justify-center items-center">
            <span className="text-center flex flex-row">
                {message}{' '}
                <Link href={linkUrl} className="underline hover:text-gray-800 text-gray-500">
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
