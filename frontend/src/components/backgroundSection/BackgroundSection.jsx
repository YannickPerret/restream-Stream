import React from 'react';

const BackgroundSection = ({ children }) => {
    return (
        <div className="relative bg-gradient-to-r from-indigo-900 via-gray-800 to-gray-900 h-80 w-full flex items-center justify-center overflow-hidden">
            {/* Background blur */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-transparent to-blue-500 opacity-50 blur-lg transform scale-y-150"></div>

            {/* Fractal shapes */}
            <div className="absolute inset-0 flex justify-center items-center">
                {/* Example Fractal Shape 1 */}
                <svg className="absolute h-32 w-32 opacity-20" viewBox="0 0 100 100">
                    <path d="M50 5 L90 90 L10 90 Z" fill="none" stroke="white" strokeWidth="2"/>
                </svg>
                {/* Example Fractal Shape 2 */}
                <svg className="absolute h-48 w-48 opacity-10" viewBox="0 0 100 100" style={{ transform: 'rotate(45deg)' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="1"/>
                </svg>
                {/* Additional shapes can be added similarly */}
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default BackgroundSection;
