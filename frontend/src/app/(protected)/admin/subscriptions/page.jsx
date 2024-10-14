'use client';
import React, { useState, useEffect } from 'react';
import Table from '#components/table/Table';
import Search from '#components/_forms/Search';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import SubscriptionApi from "#api/subscription.js";
import Panel from "#components/layout/panel/Panel";
import Button from "#components/_forms/Button.jsx";
import SubscriptionAdminApi from "#api/admin/subscription.js";

const SubscriptionIndexPage = () => {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubscriptions = async () => {
            const data = await SubscriptionApi.getAllByAdmin();
            setSubscriptions(data);
            setFilteredSubscriptions(data);
            setLoading(false);
        };

        loadSubscriptions();
    }, []);

    const handleUserSelect = (user) => {
        if (user) {
            const filtered = subscriptions.filter(subscription => subscription.user.id === user.id);
            setFilteredSubscriptions(filtered);
        } else {
            setFilteredSubscriptions(subscriptions);
        }
    };

    const handleRenewSubscription = async (id) => {
        try {
            await SubscriptionAdminApi.renewSubscription(id);
            router.push('/admin/subscriptions');
        } catch (error) {
            console.error('Failed to renew subscription:', error);
        }
    }

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
                    <Link href={`/admin/subscriptions/${row.id}/cancel`}>
                        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg ml-2">
                            Cancel
                        </button>
                    </Link>

                    <Button label={'Renew'} onClick={() => {
                        handleRenewSubscription(row.id);
                    }}/>
                </>
            ),
        },
    ];

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Panel
            title="Subscriptions"
            darkMode={true}
            buttonLink="/admin/subscriptions/create"
            buttonLabel="Create New Subscription"
            breadcrumbPath={[
                { label: 'Home', href: '/' },
                { label: 'Admin', href: '/admin' },
                { label: 'Subscriptions', href: '/admin/subscriptions' },
                ]}>
            <Search
                searchUrl="users"
                label="Search Users"
                updateSelectedItems={handleUserSelect}
                displayFields={['username', 'email']}
                showSelectedItems={false}
            />
            <Table columns={columns} data={filteredSubscriptions}/>
        </Panel>
)
    ;
};

export default SubscriptionIndexPage;
