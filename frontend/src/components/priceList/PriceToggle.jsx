import React from 'react';

const PriceToggle = ({ isMonthly, setIsMonthly }) => {
    return (
        <div className="inline-flex bg-gray-700 rounded-full p-1">
            <button
                onClick={() => setIsMonthly(true)}
                className={`px-6 py-2 rounded-full ${isMonthly ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                Monthly
            </button>
            <button
                onClick={() => setIsMonthly(false)}
                className={`px-6 py-2 rounded-full ${!isMonthly ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                Annually
            </button>
        </div>
    );
};

export default PriceToggle;
