'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import useOrderStore from "#stores/useOrderStore";
import useProductStore from "#stores/useProductStore";

const CheckoutSuccessPage = () => {
    const { order, paymentIntent } = useOrderStore();
    const { fetchProductById, products } = useProductStore();

    useEffect(() => {
        const fetchProducts = async () => {
            if (order && order.items && order.items.length > 0) {
                const productId = order.items[0].productId;
                await fetchProductById(productId);
            }
        };

        fetchProducts();
    }, [order, fetchProductById]);

    if (!products.length || !order || !paymentIntent) {
        return <div>Loading...</div>;
    }

    const product = products[0];

    return (
        <section className="flex flex-col w-full h-full justify-center items-center p-8 bg-gradient-to-br from-blue-900 to-gray-900 text-white pt-44">
            <div className="w-full max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="mb-6">
                    <h1 className="text-5xl font-extrabold mb-4 text-white">🎉 Order Success! 🎉</h1>
                    <p className="text-lg text-gray-300">
                        Thank you for your purchase! We’re excited to have you as part of our community.
                    </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-6 mb-6">
                    <h2 className="text-3xl font-semibold text-white mb-2">Order Summary</h2>
                    <div className="text-left text-gray-300">
                        <p className="mb-2"><span className="font-bold">Order ID:</span> {order.id}</p>
                        <p className="mb-2"><span className="font-bold">Product:</span> {product?.title || 'N/A'}</p>
                        <p className="mb-2"><span className="font-bold">Amount Paid:</span> {order.totalAmount} {paymentIntent.currency.toUpperCase()}</p>
                    </div>
                </div>

                <p className="text-lg text-gray-400 mb-6">
                    A confirmation email has been sent to you with the order details. If you have any questions, feel free to contact our support team.
                </p>

                <Link href="/dashboard">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                        Continue to Dashboard
                    </button>
                </Link>

                <p className="text-sm text-gray-500 mt-4">
                    Want to see more products? <Link href="/#pricing" className="text-indigo-400 hover:text-indigo-300">Browse our collection</Link>.
                </p>
            </div>
        </section>
    );
};

export default CheckoutSuccessPage;
