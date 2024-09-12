'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useSubscriptionStore from '#stores/useSubscriptionStore';
import Link from "next/link";
import {ArrowLeft} from "lucide-react";

const SubscriptionShowPage = () => {
    const { id } = useParams();
    const { fetchSubscriptionById, selectedSubscription } = useSubscriptionStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubscription = async () => {
            await fetchSubscriptionById(id);
            setLoading(false);
        };

        loadSubscription();
    }, [id, fetchSubscriptionById]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!selectedSubscription) {
        return <div>Subscription not found</div>;
    }

    console.log('selectedSubscription', selectedSubscription);
    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl p-8 bg-gradient-to-r from-indigo-900 via-gray-900 to-black">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-semibold">Subscription #{selectedSubscription.id} details</h1>
                    <Link href={"/admin/subscriptions"}
                          className="flex items-center mt-2 text-sm text-gray-300 hover:text-white">
                        <ArrowLeft className="w-4 h-4"/>&nbsp; Back to Subscriptions
                    </Link>
                </header>

                <hr className="border-b-1 border-blueGray-300 pb-6"/>

                    <div className="shadow-md rounded p-4 text-white">
                        <p>User: {selectedSubscription.user.username}</p>
                        <p>Email : {selectedSubscription.user.email}</p>
                        <p>Product: {selectedSubscription.product.title}</p>
                        <p>Status: {selectedSubscription.status}</p>
                        <p>Purchase date : {selectedSubscription.createdAt}</p>
                        <p>Expires at: {new Date(selectedSubscription.expiresAt).toLocaleDateString()}</p>
                        <h3 className="mt-4">Features:</h3>
                        <ul className="list-disc ml-5">
                            {selectedSubscription.features.map((feature, index) => (
                                <li key={index}>
                                    {feature.name}: {feature.value}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
        </section>
);
};

export default SubscriptionShowPage;
