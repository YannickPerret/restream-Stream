'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Input from '#components/_forms/Input';
import Button from '#components/_forms/Button';
import ProductApi from "#api/product.js";

const CreateProductPage = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [annualPrice, setAnnualPrice] = useState('');
    const [directDiscount, setDirectDiscount] = useState('');
    const [labelFeatures, setLabelFeatures] = useState('');
    const [features, setFeatures] = useState([]);

    const handleAddFeature = () => {
        setFeatures([...features, { name: '', value: '' }]);
    };

    const handleFeatureChange = (index, field, value) => {
        const updatedFeatures = features.map((feature, i) =>
            i === index ? { ...feature, [field]: value } : feature
        );
        setFeatures(updatedFeatures);
    };

    const handleRemoveFeature = (index) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = {
            title,
            monthlyPrice: parseInt(monthlyPrice),
            annualPrice: parseInt(annualPrice),
            directDiscount: parseInt(directDiscount),
            labelFeatures: labelFeatures.split(',').map((feature) => feature.trim()), // Ensure labelFeatures is an array
            features: features.map((feature) => ({
                name: feature.name,
                value: feature.value,
            })),
        };
        await ProductApi.create(productData)
        router.push('/admin/products');
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

                    <Input
                        label="Label Features"
                        value={typeof labelFeatures === 'string' ? labelFeatures : labelFeatures.join(', ')} // Handle empty arrays
                        onChange={(e) => setLabelFeatures(e.target.value)}
                        placeholder="Separate with commas, e.g., feature1, feature2"
                    />
                </FormGroup>

                <FormGroup title="Product Features">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center mb-4">
                            <Input
                                label={`Feature ${index + 1} Name`}
                                value={feature.name}
                                onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                                className="mr-4"
                            />
                            <Input
                                label={`Feature ${index + 1} Value`}
                                value={feature.value}
                                onChange={(e) => handleFeatureChange(index, 'value', e.target.value)}
                                className="mr-4"
                            />
                            <Button type="button" label="Remove" onClick={() => handleRemoveFeature(index)} className="text-red-500" />
                        </div>
                    ))}
                    <Button type="button" label="Add Feature" onClick={handleAddFeature} className="mt-4" />
                </FormGroup>

                <div className="flex justify-end">
                    <Button label="Create Product" type="submit" />
                </div>
            </Form>
        </div>
    );
};

export default CreateProductPage;
