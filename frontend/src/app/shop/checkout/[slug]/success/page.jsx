'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useOrderStore from "#stores/useOrderStore";
import OrderApi from '#api/order';
import Image from "next/image";

const CheckoutSuccessPage = () => {
    const { slug } = useParams();
    const { setOrderData, orders } = useOrderStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderResponse = await OrderApi.getOneBySlug(slug);
                console.log(orderResponse);
                setOrderData(orderResponse);

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch order', error);
                setLoading(false);
            }
        };

        fetchOrder();
    }, [slug, setOrderData]);

    if (loading || !orders) {
        return <div>Loading...</div>;
    }

    // Calculate subtotal by summing unit price * quantity for all items
    const subtotal = orders.items?.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0) || 0;

    return (
        <section className="flex flex-col w-full h-full justify-center shadow-2xl pt-44 bg-cover bg-no-repeat bg-center"
                 style={{ backgroundImage: "url('/hero_background.svg')" }}>
            <div className="w-full max-w-5xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="mb-6">
                    <h1 className="text-5xl font-extrabold mb-4 text-white">🎉 Order Success! 🎉</h1>
                    <p className="text-lg text-gray-300">
                        Thank you for your purchase! We’re excited to have you as part of our community.
                    </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-6 mb-6">
                    <h2 className="text-3xl font-semibold text-white mb-2">Order Summary</h2>
                    <div className="text-left text-gray-300">
                        <p className="mb-2"><span className="font-bold">Command Number:</span> {orders.id}</p>

                        {orders.items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Image
                                        src={item.product.signedLogoPath}
                                        alt={item.product.title}
                                        className="w-16 h-16 object-cover rounded mr-4"
                                        width={50}
                                        height={50}
                                    />
                                    <p className="text-xl font-medium">{item.product.title} - {item.frequency}</p>
                                </div>
                                <div className="text-right">
                                    {item.product.purchaseType === 'subscription' && item.frequency === 'annual' ? (
                                        <div>
                                            <p className="text-l text-red-400 line-through">{orders.currency.toUpperCase()} {item.product.annualPrice} /year</p>
                                            <p className="text-xl text-white font-bold">{orders.currency.toUpperCase()} {(Math.round((item.product.annualPrice * (1 - item.product.directDiscount / 100)))).toFixed(0)} /year</p>
                                        </div>
                                    ) : (
                                        <p className="text-xm text-white font-bold">
                                            {item.totalAmount === 0 ? 'Free' : `${orders.currency.toUpperCase()} ${item.totalAmount.toFixed(0)}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Subtotal and other details */}
                        <div className="border-t my-4 py-2 flex justify-between text-gray-400">
                            <span>Subtotal</span>
                            <span>{orders.currency.toUpperCase()} {subtotal.toFixed(0)}</span>
                        </div>

                        <div className="my-4 py-2 flex justify-between text-gray-400">
                            <span>Discounts</span>
                            {orders.discounts.length > 0 ? (
                                <div className={'flex flex-col'}>
                                    {orders.discounts.map((discount, index) => (
                                        <div key={index} className="flex justify-between gap-6">
                                            <span className={"italic"}>{discount.name}</span>
                                            <span className={'text-red-400'}> {discount.type === 'percentage'
                                                ? `-$${((subtotal * discount.amount) / 100).toFixed(0)} ${orders.currency.toUpperCase()}`
                                                : `-$${discount.amount.toFixed(0)} ${orders.currency.toUpperCase()}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span>$0</span>
                            )}
                        </div>

                        <div className="border-t mt-4 pt-2 flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span>{orders.currency.toUpperCase()} {orders.totalAmount.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                <p className="text-lg text-gray-400 mb-6">
                    A confirmation email has been sent to you with the order details. If you have any questions, feel
                    free to contact our support team.
                </p>

                <Link href="/dashboard">
                    <button
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                        Continue to Dashboard
                    </button>
                </Link>

                <p className="text-sm text-gray-500 mt-4">
                    Want to see more products? <Link href="/#pricing" className="text-indigo-400 hover:text-indigo-300">Browse
                    our collection</Link>.
                </p>
            </div>
        </section>
    );
};

export default CheckoutSuccessPage;