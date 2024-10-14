import React from 'react';
import Link from 'next/link';
import Breadcrumb from "#components/breadcrumb/Breadcrumb.jsx";

const Panel = ({ title, darkMode = false, children, buttonLink = null, buttonLabel = null, buttonDisable = false, className = '', breadcrumbPath = [] }) => {
    const panelClass = darkMode
        ? 'bg-gray-900 text-white p-8 rounded-lg shadow-lg'
        : 'bg-white text-black p-8 rounded-lg shadow-lg';

    return (
        <section className={`w-full h-full ${panelClass} ${className}`}>
            <div className="container mx-auto">
                {breadcrumbPath.length > 0 && (
                    <div className="mb-4">
                        <Breadcrumb paths={breadcrumbPath} />
                    </div>
                )}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl py-4">{title}</h1>
                    {buttonLink && buttonLabel && (
                        <Link href={buttonLink}>
                            <button className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg ${buttonDisable ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={buttonDisable}>
                                {buttonLabel}
                            </button>
                        </Link>
                    )}
                </div>
            </div>
            <hr className="border-b-1 border-blueGray-300 pb-6" />
            <div className="panel-content">
                {children}
            </div>
        </section>
    );
};

export default Panel;
