'use client'
import React, { useState } from 'react';
import PriceCard from './PriceCard';
import PriceToggle from './PriceToggle';

const PriceList = () => {
    const [isMonthly, setIsMonthly] = useState(true); // State for toggling between monthly and annually

    return (
        <div className="bg-gray-900 text-white py-36">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl font-bold">Simple pricing, no commitment</h1>
                <p className="text-gray-400 mt-4">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos odit doloribus molestiae voluptatum quos odit doloribus.</p>

                <div className="flex justify-center mt-6">
                    <PriceToggle isMonthly={isMonthly} setIsMonthly={setIsMonthly} />
                </div>

                <div className="flex flex-col lg:flex-row justify-center items-center mt-12 gap-8">
                    <PriceCard
                        title="Starter"
                        monthlyPrice={9}
                        annualPrice={100} // Custom annual price
                        discount={16} // 16% discount example
                        isMonthly={isMonthly} // Passing the state to PriceCard
                        features={['Basic invoicing', 'Easy to use accounting', 'Multi-accounts']}
                        buttonText="Buy this plan"
                        isHighlighted={false}
                    />
                    <PriceCard
                        title="Scale"
                        monthlyPrice={39}
                        annualPrice={430} // Custom annual price
                        discount={16} // 16% discount example
                        isMonthly={isMonthly} // Passing the state to PriceCard
                        features={['Advanced invoicing', 'Easy to use accounting', 'Multi-accounts', 'Tax planning toolkit', 'VAT & VATMOSS filing', 'Free bank transfers']}
                        buttonText="Buy this plan"
                        isHighlighted={true}
                    />
                    <PriceCard
                        title="Growth"
                        monthlyPrice={99}
                        annualPrice={1000} // Custom annual price
                        discount={16} // 16% discount example
                        isMonthly={isMonthly} // Passing the state to PriceCard
                        features={['Basic invoicing', 'Easy to use accounting', 'Multi-accounts', 'Tax planning toolkit']}
                        buttonText="Buy this plan"
                        isHighlighted={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default PriceList;
