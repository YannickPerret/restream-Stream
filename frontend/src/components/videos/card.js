import React from 'react';

export default function VideoCard({ children, title, footer }) {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg">
            <div className="px-6 py-2">
                <h2 className="font-bold text-xl mb-2">{title}</h2>
            </div>

            <div className="px-6 py-2">
                {children}
            </div>

            <footer className="px-6 py-2">
                {footer}
            </footer>
        </div>
    );
}
