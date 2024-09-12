import React from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';

const PriceCard = ({
                       id,
                       title,
                       monthlyPrice,
                       annualPrice,
                       discount,
                       isMonthly,
                       labelFeatures,
                       buttonText,
                       isHighlighted,
                       borderColor, // Couleur unie
                       borderGradient // Dégradé (optionnel)
                   }) => {
    const monthlyCost = `$${monthlyPrice}`;
    const annualCost = `$${annualPrice}`;
    const annualTotalWithDiscount = (annualPrice * (100 - discount) / 100).toFixed(0);
    const router = useRouter();

    const handleCheckout = () => {
        router.push(`/shop/checkout?productId=${id}&isMonthly=${isMonthly}`);
    };

    return (
        <div className="relative bg-gray-50 p-6 rounded-lg shadow-lg w-full max-w-sm border-2 border-gray-200flex flex-col justify-between" >
            {/* Bordure supérieure avec dégradé */}
            {borderGradient ? (
                <div
                    className="absolute top-0 left-0 w-full h-2 rounded-t-lg"
                    style={{
                        background: 'linear-gradient(90deg, #7988F2 0%, #C977B0 46%, #32BD00 100%)'
                    }}
                />
            ) : (
                <div
                    className="absolute top-0 left-0 w-full h-2 rounded-t-lg"
                    style={{
                        backgroundColor: borderColor
                    }}
                />
            )}

            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-full">
                <Image src="/icones/fusee.svg" alt="Rocket Icon" width={50} height={50} />
            </div>

            <h2 className={`text-xl font-bold mt-12 ${isHighlighted ? 'text-black' : 'text-gray-700'}`}>{title}</h2>
            <div className="mt-4">
                {isMonthly ? (
                    <div>
                        <span className="text-4xl font-extrabold text-gray-900">{monthlyCost}</span>
                        <span className="text-lg text-gray-700"> / Monthly</span>
                    </div>
                ) : (
                    <div>
                        <span className="text-sm text-red-500 line-through">{annualCost}</span>
                        <div>
                            <span className="text-4xl font-extrabold text-gray-900">{annualTotalWithDiscount}</span>
                            <span className="text-lg ml-2 text-gray-700"> / Annually</span>
                            <span className="text-sm text-green-500 ml-2">({discount}% off)</span>
                        </div>
                    </div>
                )}
            </div>
            <hr className="mt-4 border-gray-300" />
            <ul className="mt-6 space-y-4 text-left">
                {labelFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                        <span className="mr-2">✓</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                className={`mt-8 w-full py-3 rounded ${isHighlighted ? 'bg-purple-600' : 'bg-gray-500'} text-white font-semibold hover:opacity-90 transition`}
                onClick={handleCheckout}>
                {buttonText}
            </button>
        </div>
    );
};

export default PriceCard;
