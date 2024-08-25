'use client'
import React, { useState } from 'react';

const Newsletter = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
    };

    return (
        <section className="relative bg-gradient-to-b from-gray-900 to-gray-800 py-16 md:py-24 px-6 text-white rounded-b-lg">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold">
                    Get notified when we're launching.
                </h2>
                <p className="text-gray-400 mt-4">
                    Reprehenderit ad esse et non officia in nulla. Id proident tempor
                    incididunt nostrud nulla et culpa.
                </p>
                <form onSubmit={handleSubmit} className="mt-8 flex justify-center">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full max-w-md px-4 py-3 text-gray-900 rounded-l-lg outline-none focus:ring-2 focus:ring-purple-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-r-lg hover:bg-gray-100 transition ease-in-out duration-150"
                    >
                        Notify me
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Newsletter;
