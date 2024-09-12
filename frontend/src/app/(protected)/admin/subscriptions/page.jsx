'use client';
import React, { useState, useEffect } from 'react';
import Table from '#components/table/Table';
import Search from '#components/_forms/Search';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import SubscriptionApi from "#api/subscription.js";

const SubscriptionIndexPage = () => {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState([]); // Store the original list of subscriptions
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]); // Store the filtered list
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubscriptions = async () => {
            const data = await SubscriptionApi.getAllByAdmin();
            setSubscriptions(data); // Store the original data
            setFilteredSubscriptions(data); // Initially, filteredSubscriptions is the same as subscriptions
            setLoading(false);
        };

        loadSubscriptions();
    }, []);

    const handleUserSelect = (user) => {
        if (user) {
            // Filter subscriptions based on selected user
            const filtered = subscriptions.filter(subscription => subscription.user.id === user.id);
            setFilteredSubscriptions(filtered);
        } else {
            // Reset to show all subscriptions if no user is selected
            setFilteredSubscriptions(subscriptions); // Reset to the original subscriptions
        }
    };

    const columns = [
        { key: 'user', title: 'User', render: (value, row) => row.user.username },
        { key: 'email', title: 'Email', render: (value, row) => row.user.email },
        { key: 'product', title: 'Product', render: (value, row) => row.product.title },
        { key: 'status', title: 'Status' },
        { key: 'expiresAt', title: 'Expires At', render: (value) => new Date(value).toLocaleDateString() },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, row) => (
                <>
                    <Link href={`/admin/subscriptions/${row.id}`}>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-lg mr-2">
                            View
                        </button>
                    </Link>
                    <Link href={`/admin/subscriptions/${row.id}/edit`}>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-lg">
                            Edit
                        </button>
                    </Link>
                </>
            ),
        },
    ];

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl p-8 bg-gradient-to-r from-indigo-900 via-gray-900 to-black">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Subscriptions</h1>
                    <Link href="/admin/subscriptions/create">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Create New Subscription
                        </button>
                    </Link>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6" />

                <Search
                    searchUrl="users"
                    label="Search Users"
                    updateSelectedItems={handleUserSelect}
                    displayFields={['username', 'email']}
                    showSelectedItems={false}
                />
                <Table columns={columns} data={filteredSubscriptions} />
            </div>
        </section>
    );
};

export default SubscriptionIndexPage;
