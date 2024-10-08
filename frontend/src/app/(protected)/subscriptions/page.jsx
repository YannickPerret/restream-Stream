'use client';

import React, { useEffect } from "react";
import { useSubscriptionStore } from "#stores/useSubscriptionStore";
import Table from "#components/table/Table";
import Image from "next/image";
import Link from "next/link";
import Button from "#components/_forms/Button.jsx";

const SubscriptionPage = () => {
    const { subscriptions, fetchSubscriptions, isLoading, error } = useSubscriptionStore();

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const columns = [
        { key: 'signedLogoPath', title: 'Icone', render: (value) => <Image src={value} alt={"Icon"} width={50} height={50} /> },
        { key: 'productName', title: 'Product' },
        { key: 'frequency', title: 'Frequency' },
        { key: 'expiresAt', title: 'Expires At' },
        { key: 'nextBillingDate', title: 'Next Billing At' },
        { key: 'status', title: 'Status' },
        { key: 'actions', title: 'Actions', render: (_, subscription) => (
            <>
                <Link href={`orders`} alt={"Renew the subscription"}>
                    <Button label={"Renew"} color={'green'} />
                </Link>

                <Link href={`subscriptions/${subscription.id}/cancel`} alt={"Cancel the subscription"}>
                    <Button label={"Cancel"} color={'red'} />
                </Link>
            </>

            )
        }
    ];

    const data = subscriptions.map(subscription => ({
        id: subscription.id,
        signedLogoPath: subscription.product?.signedLogoPath,
        productName: subscription.product?.title || "Unknown Product",
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        frequency: subscription.frequency,
        nextBillingDate: subscription.nextBillingDate,
    }));

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Subscriptions</h1>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">Error: {error}</div>
                ) : (
                    <Table columns={columns} data={data}/>
                )}
            </div>
        </section>
    );
};

export default SubscriptionPage;
