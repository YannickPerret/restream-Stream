'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import useOrderStore from "#stores/useOrderStore.js";
import useProductStore from "#stores/useProductStore.js";

const CheckoutSuccessPage = () => {
    const { order, paymentIntent } = useOrderStore();
    const { fetchProductById, products } = useProductStore();

    useEffect(() => {
        const fetchProducts = async () => {
            if (order && order.items && order.items.length > 0) {
                const productId = order.items[0].productId; // Assuming there's only one item
                await fetchProductById(productId);
            }
        };

        fetchProducts();
    }, [order, fetchProductById]);

    // Conditional check if product or payment data is not yet loaded
    if (!products.length || !order || !paymentIntent) {
        return <div>Loading...</div>;
    }

    const product = products[0]; // Assuming the fetched product is the first in the array

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl p-8 bg-gradient-to-r from-indigo-900 via-gray-900 to-black">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-center text-white">Thank You for Your Purchase!</h1>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6" />

                <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>

                    <div className="text-gray-300">
                        <p className="text-lg">Order Id: {order.id}</p>

                    </div>

                    <div>
                        <p className="text-lg mb-4">Product: {product?.title || 'N/A'}</p>
                        <p className="text-lg mb-4">Amount: {order.totalAmount} {paymentIntent.currency}</p>
                    </div>

                    <hr className="my-4 border-gray-600"/>

                    <p className="text-lg text-gray-400">
                        You will receive a confirmation email shortly. Thank you for shopping with us!
                    </p>

                    <div className="mt-6">
                        <Link href="/dashboard" className="text-indigo-500 hover:underline">
                            Continue to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutSuccessPage;
