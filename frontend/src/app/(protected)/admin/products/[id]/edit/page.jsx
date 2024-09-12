'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Input from '#components/_forms/Input';
import Button from '#components/_forms/Button';
import useProductStore from '#stores/useProductStore';
import ProductApi from '#api/product';
import {useParams} from "next/navigation";

const EditProductPage = () => {
    const router = useRouter();
    const { id } = useParams();

    const { fetchProductById, isLoading } = useProductStore();
    const [product, setProduct] = useState(null);

    const [title, setTitle] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [annualPrice, setAnnualPrice] = useState('');
    const [directDiscount, setDirectDiscount] = useState('');
    const [labelFeatures, setLabelFeatures] = useState('');
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        const loadProduct = async () => {
            const fetchedProduct = await fetchProductById(id);
            setProduct(fetchedProduct);
            setTitle(fetchedProduct.title);
            setMonthlyPrice(fetchedProduct.monthlyPrice);
            setAnnualPrice(fetchedProduct.annualPrice);
            setDirectDiscount(fetchedProduct.directDiscount);
            setLabelFeatures(fetchedProduct.labelFeatures);
            setFeatures(fetchedProduct.features.map(feature => ({
                id: feature.id,
                name: feature.name,
                value: feature.pivotValue || ''
            })));

            console.log(fetchedProduct);
        };

        if (id) {
            loadProduct();
        }
    }, [id, fetchProductById]);

    const handleFeatureChange = (index, field, value) => {
        const updatedFeatures = [...features];
        updatedFeatures[index][field] = value;
        setFeatures(updatedFeatures);
    };

    const handleAddFeature = () => {
        setFeatures([...features, { id: null, name: '', value: '' }]);
    };

    const handleRemoveFeature = (index) => {
        const updatedFeatures = features.filter((_, i) => i !== index);
        setFeatures(updatedFeatures);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedProductData = {
            title,
            monthlyPrice: parseInt(monthlyPrice, 10),
            annualPrice: parseInt(annualPrice, 10),
            directDiscount: parseInt(directDiscount, 10),
            labelFeatures: labelFeatures,
            features: features.map(({ name, value }) => ({ name, value })),
        };

        console.log("twest", updatedProductData);
        try {
            await ProductApi.update(id, updatedProductData);
            //router.push('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    if (isLoading || !product) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold mb-6 text-white">Edit Product</h1>
            <Form onSubmit={handleSubmit}>
                <FormGroup title="Product Information">
                    <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Input label="Monthly Price" type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} />
                    <Input label="Annual Price" type="number" value={annualPrice} onChange={(e) => setAnnualPrice(e.target.value)} />
                    <Input label="Direct Discount (%)" type="number" value={directDiscount} onChange={(e) => setDirectDiscount(e.target.value)} />
                    <Input label="Label Features"  value={labelFeatures.join(', ')} onChange={(e) => setLabelFeatures(e.target.value)} />
                </FormGroup>

                <FormGroup title="Features">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <Input
                                label="Feature Name"
                                value={feature.name}
                                onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                                className="mr-2"
                            />
                            <Input
                                label="Value"
                                value={feature.value}
                                onChange={(e) => handleFeatureChange(index, 'value', e.target.value)}
                                className="mr-2"
                            />
                            <Button type="button" label="Remove" onClick={() => handleRemoveFeature(index)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg" />
                        </div>
                    ))}
                    <Button type="button" label="Add Feature" onClick={handleAddFeature} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-lg mt-2" />
                </FormGroup>

                <div className="flex justify-end mt-4">
                    <Button label="Update Product" type="submit" />
                </div>
            </Form>
        </div>
    );
};

export default EditProductPage;
