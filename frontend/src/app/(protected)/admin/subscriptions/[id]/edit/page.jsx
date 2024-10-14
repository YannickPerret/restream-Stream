'use client'
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Search from '#components/_forms/Search';
import Button from '#components/_forms/Button';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Input from '#components/_forms/Input';
import Label from '#components/_forms/Label';
import { useSubscriptionStore } from "#stores/useSubscriptionStore.js";
import Panel from "#components/layout/panel/Panel.jsx";

// Fonction pour convertir une date de format 'dd/MM/yyyy' en 'yyyy-MM-dd'
const convertToISODate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`; // Reformatage en ISO
};

const SubscriptionEditPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const { fetchSubscriptionById, updateSubscription, selectedSubscription } = useSubscriptionStore();

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [status, setStatus] = useState('inactive');
    const [expiresAt, setExpiresAt] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        const loadSubscriptionData = async () => {
            const subscription = await fetchSubscriptionById(id);
            console.log(subscription);
            if (subscription) {
                setSelectedUser(subscription.user);
                setSelectedProduct(subscription.product);
                setStatus(subscription.status);

                // Conversion et formatage des dates avant de les utiliser
                if (subscription.expiresAt) {
                    const formattedExpiresAt = convertToISODate(subscription.expiresAt);
                    setExpiresAt(formattedExpiresAt); // Formater la date pour l'input
                }
                if (subscription.createdAt) {
                    const formattedCreatedAt = convertToISODate(subscription.createdAt);
                    setPurchaseDate(formattedCreatedAt); // Formater la date pour l'input
                }

                setFeatures(subscription.features || []);
            }
        };

        if (id) {
            loadSubscriptionData();
        }
    }, [id, fetchSubscriptionById]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedUser || !selectedProduct) {
            alert('Please select both a user and a product.');
            return;
        }

        const subscriptionData = {
            userId: selectedUser.id,
            productId: selectedProduct.id,
            status,
            expiresAt,
            features, // Inclure les fonctionnalités mises à jour
            createdAt: purchaseDate,
        };

        await updateSubscription(id, subscriptionData)
            .then(() => {
                //router.push('/admin/subscriptions');
            })
            .catch((error) => {
                console.error('Error updating subscription:', error);
            });
    };

    const handleCancelUserEdit = () => {
        setSelectedUser(selectedSubscription?.user); // Revenir à l'utilisateur original
        setIsEditingUser(false); // Masquer le composant de recherche
    };

    const handleCancelProductEdit = () => {
        setSelectedProduct(selectedSubscription?.product); // Revenir au produit original
        setIsEditingProduct(false); // Masquer le composant de recherche
    };

    const handleFeatureChange = (index, field, value) => {
        const updatedFeatures = [...features];
        updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
        setFeatures(updatedFeatures);
    };

    const addFeature = () => {
        setFeatures((prevFeatures) => Array.isArray(prevFeatures) ? [...prevFeatures, { name: '', value: '' }] : [{ name: '', value: '' }]);
    };

    const removeFeature = (index) => {
        const updatedFeatures = [...features];
        updatedFeatures.splice(index, 1);
        setFeatures(updatedFeatures);
    };

    if (!selectedSubscription) {
        return <div>Loading...</div>;
    }

    return (
        <Panel title="Edit Subscription" darkMode={true} breadcrumbPath={[
            {href: '/', label: 'Home'},
            {href: '/admin', label: 'Admin'},
            {href: '/admin/subscriptions', label: 'Subscriptions'},
            {label: 'Edit'}
        ]}>
            <Form onSubmit={handleSubmit}>
                <FormGroup title="User">
                    {!isEditingUser ? (
                        <div>
                            <p>{selectedUser?.username || selectedSubscription.user?.username || 'N/A'}</p>
                            <Button label="Update User" onClick={() => setIsEditingUser(true)} />
                        </div>
                    ) : (
                        <>
                            <Search
                                searchUrl="users"
                                label="Search User"
                                updateSelectedItems={setSelectedUser}
                                multiple={false}
                                displayFields={['username', 'email']}
                            />
                            <Button label="Cancel" onClick={handleCancelUserEdit} />
                        </>
                    )}
                </FormGroup>

                <FormGroup title="Product">
                    {!isEditingProduct ? (
                        <div>
                            <p>{selectedProduct?.title || selectedSubscription.product?.title || 'N/A'}</p>
                            <Button label="Update Product" onClick={() => setIsEditingProduct(true)} />
                        </div>
                    ) : (
                        <>
                            <Search
                                searchUrl="products"
                                label="Search Product"
                                updateSelectedItems={setSelectedProduct}
                                multiple={false}
                                displayFields={['title']}
                            />
                            <Button label="Cancel" onClick={handleCancelProductEdit} />
                        </>
                    )}
                </FormGroup>

                <FormGroup title="Subscription Details">
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

                    <Label htmlFor="purchaseAt">Purchase date</Label>
                    <Input
                        type="date"
                        name="purchaseAt"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        required
                    />

                    <Label htmlFor="expiresAt">Expires At</Label>
                    <Input
                        type="date"
                        name="expiresAt"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        required
                    />
                </FormGroup>

                {/* Features Section */}
                <FormGroup title="Subscription Features">
                    {Array.isArray(features) && features.length > 0 ? (
                        features.map((feature, index) => (
                            <div key={index} className="mb-4">
                                <Label htmlFor={`feature-${index}-name`}>Feature Name</Label>
                                <Input
                                    type="text"
                                    name={`feature-${index}-name`}
                                    value={feature.name}
                                    onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                                    required
                                />
                                <Label htmlFor={`feature-${index}-value`}>Feature Value</Label>
                                <Input
                                    type="text"
                                    name={`feature-${index}-value`}
                                    value={feature.value}
                                    onChange={(e) => handleFeatureChange(index, 'value', e.target.value)}
                                    required
                                />
                                <Button label="Remove Feature" onClick={() => removeFeature(index)} />
                            </div>
                        ))
                    ) : (
                        <p>No features available</p>
                    )}
                    <Button label="Add Feature" onClick={addFeature} />
                </FormGroup>


                <div className="flex justify-end mt-6">
                    <Button label="Update Subscription" type="submit" color={'sky'} />
                </div>
            </Form>
        </Panel>
    );
};

export default SubscriptionEditPage;
