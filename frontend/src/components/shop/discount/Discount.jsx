import React, { useState } from 'react';
import useDiscountStore from '#stores/useDiscountStore';

const Discount = ({ label = 'Enter discount code', onDiscountApplied, placeholder = 'Enter your discount' }) => {
    const [discountCode, setDiscountCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { applyDiscount, error } = useDiscountStore();

    const handleApplyDiscount = async () => {
        setLoading(true);
        try {
            const discount = await applyDiscount(discountCode);
            if (discount) {
                onDiscountApplied(discount);
            }
        } catch (err) {
            console.error('Error applying discount:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <label htmlFor="discount-code" className="text-gray-400">{label}</label>
            <div className="flex mt-2">
                <input
                    type="text"
                    id="discount-code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={placeholder}
                    disabled={loading}
                />
                <button
                    onClick={handleApplyDiscount}
                    className={`ml-2 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-md ${loading && 'opacity-50 cursor-not-allowed'}`}
                    disabled={loading}
                >
                    {loading ? 'Applying...' : 'Apply'}
                </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default Discount;
