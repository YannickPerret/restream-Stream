
'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Input from '#components/_forms/Input';
import Button from '#components/_forms/Button';
import useProductStore from '#stores/useProductStore';

const CreateProductPage = () => {
    const router = useRouter();
    const { addProduct } = useProductStore();

    const [title, setTitle] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [annualPrice, setAnnualPrice] = useState('');
    const [directDiscount, setDirectDiscount] = useState('');
    const [features, setFeatures] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = {
            title,
            monthlyPrice: parseInt(monthlyPrice),
            annualPrice: parseInt(annualPrice),
            directDiscount: parseInt(directDiscount),
            features: features.split(','), // Convert comma-separated string into an array
        };

        await addProduct(productData);
        router.push('/products');
    };

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold mb-6 text-white">Create New Product</h1>
            <Form onSubmit={handleSubmit}>
                <FormGroup title="Product Information">
                    <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Input label="Monthly Price" type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} />
                    <Input label="Annual Price" type="number" value={annualPrice} onChange={(e) => setAnnualPrice(e.target.value)} />
                    <Input label="Direct Discount (%)" type="number" value={directDiscount} onChange={(e) => setDirectDiscount(e.target.value)} />
                    <Input label="Features" placeholder="Separate features with commas" value={features} onChange={(e) => setFeatures(e.target.value)} />
                </FormGroup>
                <div className="flex justify-end">
                    <Button label="Create Product" type="submit" />
                </div>
            </Form>
        </div>
    );
};

export default CreateProductPage;
