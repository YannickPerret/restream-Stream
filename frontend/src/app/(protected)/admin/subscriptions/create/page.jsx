'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Search from '#components/_forms/Search';
import Button from '#components/_forms/Button';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Input from '#components/_forms/Input';
import Label from '#components/_forms/Label';
import {useSubscriptionStore} from "#stores/useSubscriptionStore.js";
import Panel from "#components/layout/panel/Panel.jsx";

const SubscriptionCreatePage = () => {
    const router = useRouter();
    const { addSubscription } = useSubscriptionStore();

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [expiresAt, setExpiresAt] = useState('');
    const [status, setStatus] = useState('inactive');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            alert('Please select a user.');
            return;
        }

        const subscriptionData = {
            userId: selectedUser.id,
            productId: selectedProduct.id,
            status,
            expiresAt,
        };

        await addSubscription(subscriptionData).then(() => {
                router.push('/admin/subscriptions');
            }
        ).catch((error) => {
            console.error(error);
        })
    };

    return (
        <Panel title={'Create Subscription'} buttonLink={'/admin/subscriptions'} buttonLabel={'Back'} darkMode={true}>
            <Form onSubmit={handleSubmit}>
                <FormGroup title="Select User">
                    <Search
                        searchUrl="users"
                        label="Search User"
                        updateSelectedItems={setSelectedUser}
                        multiple={false}
                        displayFields={['username', 'email']}
                    />
                </FormGroup>

                <FormGroup title="Subscription Details">
                    <Search
                        searchUrl="products"
                        label="Select a product"
                        updateSelectedItems={setSelectedProduct}
                        multiple={false}
                        displayFields={['title', 'isActive']}
                    />

                    <Label htmlFor="status">Status</Label>
                    <select
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-gray-900 text-white p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                    >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="canceled">Canceled</option>
                    </select>

                    <Label htmlFor="expiresAt">Expires At</Label>
                    <Input
                        type="date"
                        name="expiresAt"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        required
                    />
                </FormGroup>

                <div className="flex justify-end mt-6">
                    <Button label="Create Subscription" type="submit" />
                </div>
            </Form>
        </Panel>
    );
};

export default SubscriptionCreatePage;
