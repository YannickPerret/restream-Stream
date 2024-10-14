import React from 'react';
import useCheckoutStore from '#stores/useCheckoutStore.js';

const PriceToggle = () => {
    const { isMonthly, setIsMonthly } = useCheckoutStore();

    const handleToggle = (value) => {
        setIsMonthly(value);
    };

    return (
        <div className="inline-flex bg-gray-700 rounded-full p-1">
            <button
                type="button"
                onClick={() => handleToggle(true)}
                className={`px-6 py-2 rounded-full ${isMonthly ? 'bg-sky-600 text-white' : 'text-gray-400'}`}>
                Monthly
            </button>
            <button
                type="button"
                onClick={() => handleToggle(false)}
                className={`px-6 py-2 rounded-full ${!isMonthly ? 'bg-sky-600 text-white' : 'text-gray-400'}`}>
                Yearly
            </button>
        </div>
    );
};

export default PriceToggle;
