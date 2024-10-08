'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Form from '#components/_forms/Form';
import FormGroup from '#components/_forms/FormGroup';
import Input from '#components/_forms/Input';
import Button from '#components/_forms/Button';
import ProductApi from "#api/product.js";
import FileUpload from "#components/_forms/FileUpload.jsx";
import Search from "#components/_forms/Search.jsx";
import Panel from "#components/layout/panel/Panel.jsx";

const CreateProductPage = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [annualPrice, setAnnualPrice] = useState('');
    const [directDiscount, setDirectDiscount] = useState('');
    const [labelFeatures, setLabelFeatures] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [features, setFeatures] = useState([]);
    const [productGroup, setProductGroup] = useState(null);

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

        // Créer un objet FormData pour gérer les fichiers
        const formData = new FormData();
        formData.append('title', title);
        formData.append('monthlyPrice', monthlyPrice);
        formData.append('annualPrice', annualPrice);
        formData.append('directDiscount', directDiscount);

        if (productGroup && productGroup.id) {
            formData.append('productGroup', productGroup.id.toString());
        } else {
            console.error("Product group is missing or invalid");
        }

        if (labelFeatures && labelFeatures.length > 0) {
            formData.append('labelFeatures', JSON.stringify(labelFeatures.split(',').map((feature) => feature.trim())));
        }

        if (imageFile) {
            formData.append('logoPath', imageFile[0]);
        }

        if (features && features.length > 0) {
            formData.append('features', JSON.stringify(features.map((feature) => ({
                name: feature.name,
                value: feature.value,
            }))));
        }

        try {
            const {message} = await ProductApi.create(formData);
            if ( message) {
                router.push('/admin/products');
            }
        } catch (error) {
            console.error("Error creating product:", error);
        }
    };


    return (
        <Panel title={'Create Product'} buttonLink={'/admin/products'} buttonLabel={'Go to back'} darkMode={true}>
            <Form onSubmit={handleSubmit}>
                <FormGroup title="Product Information">
                    <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    <Input label="Monthly Price" type="number" value={monthlyPrice}
                           onChange={(e) => setMonthlyPrice(e.target.value)}/>
                    <Input label="Annual Price" type="number" value={annualPrice}
                           onChange={(e) => setAnnualPrice(e.target.value)}/>
                    <Input label="Direct Discount (%)" type="number" value={directDiscount}
                           onChange={(e) => setDirectDiscount(e.target.value)}/>

                    <Search
                        label="Product group"
                        searchUrl='productGroups'
                        multiple={false}
                        updateSelectedItems={setProductGroup}
                        showSelectedItems={true}
                        displayFields={['name']}
                        placeholder={"2024..."}
                    />

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

                <FormGroup title={"Assets"}>
                    <FileUpload
                        label="Upload Logo"
                        description="Supported formats: PNG, JPG, Webp, SVG"
                        id="logo-upload"
                        onChange={(file) => setImageFile(file)}
                        accept={['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/svg+xml']}
                        multiple={false}
                    />
                </FormGroup>

                <div className="flex justify-end">
                    <Button label="Create Product" type="submit" />
                </div>
            </Form>
        </Panel>
    );
};

export default CreateProductPage;
