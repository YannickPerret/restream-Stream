'use client';

import React, { useEffect } from "react";
import { useSubscriptionStore } from "#stores/useSubscriptionStore";
import Table from "#components/table/Table";

const SubscriptionPage = () => {
    const { subscriptions, fetchSubscriptions, isLoading, error } = useSubscriptionStore();

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const columns = [
        { key: 'productName', title: 'Product' },
        { key: 'status', title: 'Status' },
        { key: 'createdAt', title: 'Purchase At' },
        { key: 'expiresAt', title: 'Expires At' },
    ];

    const data = subscriptions.map(subscription => ({

        productName: subscription.product.title || "Unknown Product",
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        createdAt: subscription.createdAt,
    }));

    console.log(subscriptions)
    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl p-8 bg-gradient-to-r from-indigo-900 via-gray-900 to-black">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Subscriptions</h1>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6" />
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">Error: {error}</div>
                ) : (
                    <Table columns={columns} data={data} />
                )}
            </div>
        </section>
    );
};

export default SubscriptionPage;
