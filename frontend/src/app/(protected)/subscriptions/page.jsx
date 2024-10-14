'use client';

import React, { useEffect } from "react";
import { useSubscriptionStore } from "#stores/useSubscriptionStore";
import Table from "#components/table/Table";
import Image from "next/image";
import Link from "next/link";
import Button from "#components/_forms/Button.jsx";
import Panel from "#components/layout/panel/Panel.jsx";

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
        <Panel title="Subscriptions" className="p-6" darkMode={true} breadcrumbPath={[
            { label: 'Home', href: '/' },
            { label: 'Subscriptions', href: '/subscriptions' }]} buttonLabel={'Add New Subscription'} buttonLink={'/subscriptions/create'} >
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">Error: {error}</div>
                ) : (
                    <Table columns={columns} data={data}/>
                )}
        </Panel>
    );
};

export default SubscriptionPage;
