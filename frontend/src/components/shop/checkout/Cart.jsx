'use client';
import React from 'react';
import Image from 'next/image';
import Discount from '#components/shop/discount/Discount.jsx';
import useCheckoutStore from "#stores/useCheckoutStore.js";

const CheckoutCart = ({ products, discounts, handleDiscountApplied, finalPrice }) => {
    const {isMonthly} = useCheckoutStore()

    const basePrice = products.reduce((total, product) => {
        if (product.purchaseType === 'subscription') {
            return total + (isMonthly ? product.monthlyPrice : Math.round(product.annualPrice * (1 - product.directDiscount / 100)));
        } else {
            return total + product.price;
        }
    }, 0);

    // Calculate the final price based on discounts
    const totalPrice = discounts.reduce((total, discount) => {
        if (discount.type === 'percentage') {
            return total - (total * discount.amount / 100);
        } else {
            return total - discount.amount;
        }
    }, basePrice);

    return (
        <div className="w-full lg:w-1/3 lg:order-last bg-gray-800 p-8 rounded-lg shadow-lg text-white mt-8">
            <h2 className="text-2xl font-bold mb-4">Order Summary :</h2>

            {/* List of products */}
            {products.map((product, index) => (
                <div key={index} className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Image src={product.signedLogoPath} alt={product.title} className="w-12 h-12 rounded mr-4" width={50} height={50} />
                        <span className="text-sm font-medium">{product.title}</span>
                    </div>
                    <div className="text-sm font-bold text-right">
                        {product.purchaseType === 'subscription' ? (
                            isMonthly ? (
                                <span className="text-xs text-gray-400">${product.monthlyPrice} /mo</span>
                            ) : (
                                <div>
                                    <span className="text-xs text-red-500 line-through">${product.annualPrice} /year</span>
                                    <br />
                                    <span className="text-lg text-white font-bold">${Math.round(product.annualPrice * (1 - product.directDiscount / 100))} /year</span>
                                </div>
                            )
                        ) : (
                            `$${product.price}`
                        )}
                    </div>
                </div>
            ))}

            <hr className="my-4 border-gray-600" />

            <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>${basePrice}</span>
            </div>

            <div className="flex justify-between text-gray-400 mt-2.5">
                <span>Discount</span>
                {discounts.length > 0 ? (
                    <div className="flex flex-col">
                        {discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{discount.name}</span>
                                <span>- ${discount.type === 'percentage' ? Math.round(basePrice * discount.amount / 100) : Math.round(discount.amount)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    "$0"
                )}
            </div>

            <hr className="my-4 border-gray-600" />

            <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total</span>
                <div className="text-right">
                    <span className="text-2xl text-white font-bold">${Math.round(totalPrice)}</span>
                </div>
            </div>

            <Discount label={"You have a discount code?"} onDiscountApplied={handleDiscountApplied} />
        </div>
    );
};

export default CheckoutCart;
