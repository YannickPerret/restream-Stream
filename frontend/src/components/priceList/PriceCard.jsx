import React from 'react';
import {useRouter} from "next/navigation";

const PriceCard = ({
                        id,
                       title,
                       monthlyPrice,
                       annualPrice,
                       discount,
                       isMonthly,
                       features,
                       buttonText,
                       isHighlighted
                   }) => {
    const monthlyCost = `$${monthlyPrice}`;
    const annualCost = `$${annualPrice}`;
    const annualTotalWithDiscount = (annualPrice * (100 - discount) / 100).toFixed(0);
    const router = useRouter();

    const handleCheckout = () => {
        router.push(`/shop/checkout?productId=${id}&isMonthly=${isMonthly}`);
    };

    return (
        <div className={`bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm ${isHighlighted ? 'bg-white text-black' : ''}`}>
            <h2 className={`text-2xl font-bold ${isHighlighted ? 'text-black' : 'text-white'}`}>{title}</h2>
            <div className="mt-4">
                {isMonthly ? (
                    <div>
                        <span className="text-5xl font-extrabold">{monthlyCost}</span>
                        <span className="text-xl"> / Monthly</span>
                    </div>
                ) : (
                    <div>
                        <span className="text-sm text-red-500 line-through">{annualCost}</span>
                        <div>
                            <span className="text-5xl font-extrabold">{annualTotalWithDiscount}</span>
                            <span className="text-xl ml-2"> / Annually</span>
                            <span className="text-sm text-green-500 ml-2">({discount}% off)</span>
                        </div>
                    </div>
                )}
            </div>
            <button className={`mt-8 w-full py-2 rounded ${isHighlighted ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-white'} font-semibold`} onClick={handleCheckout}>
                {buttonText}
            </button>
            <ul className="mt-6 space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <span className={`mr-2 ${isHighlighted ? 'text-indigo-600' : 'text-white'}`}>✓</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PriceCard;
