'use client'
import React, {useEffect, useState} from 'react';
import PriceCard from './PriceCard';
import PriceToggle from './PriceToggle';
import useProductStore from "#stores/useProductStore.js";

const PriceList = () => {
    const [isMonthly, setIsMonthly] = useState(true); // State for toggling between monthly and annually
    const { products, fetchProducts, isLoading } = useProductStore();

    useEffect(() => {
        fetchProducts(); // Fetch products on component mount
    }, [fetchProducts]);

    if (isLoading) return <div>Loading...</div>;

    console.log(products)
    return (
        <div className="bg-gray-900 text-white py-36">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl font-bold">Simple pricing, no commitment</h1>
                <p className="text-gray-400 mt-4">Choose the plan that fits your needs and start maximizing your streaming potential. No contracts, no hidden fees—just straightforward pricing to help you grow your channel</p>

                <div className="flex justify-center mt-6">
                    <PriceToggle isMonthly={isMonthly} setIsMonthly={setIsMonthly} />
                </div>

                <div className="flex flex-col lg:flex-row justify-center items-center mt-12 gap-8">
                    {products.map((product, index) => (
                        <PriceCard
                            id={product.id}
                            key={product.id}
                            title={product.title}
                            monthlyPrice={product.monthlyPrice}
                            annualPrice={product.annualPrice}
                            discount={product.directDiscount}
                            isMonthly={isMonthly}
                            labelFeatures={product.labelFeatures}
                            buttonText="Buy this plan"
                            isHighlighted={index === 1 ? true : false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PriceList;
