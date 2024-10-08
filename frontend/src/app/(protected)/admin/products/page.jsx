'use client'
import React, { useEffect } from 'react';
import Link from 'next/link';
import useProductStore from '#stores/useProductStore';
import Table from '#components/table/Table';
import Image from "next/image";
import Panel from "#components/layout/panel/Panel.jsx";
import Button from "#components/_forms/Button.jsx";
import ProductAdminApi from "#api/admin/product.js";

const IndexProductPage = () => {
    const { fetchProducts, products, removeProduct } = useProductStore();

    useEffect(() => {
        fetchProducts();

    }, [fetchProducts]);

    const handleDelete = async (id) => {
        try {
            await ProductAdminApi.delete(id);
            removeProduct(id);
        }
        catch (error) {
            console.log(error);
        }
    }

    const columns = [
        {
            key: 'signedLogoPath',
            title: 'Icon',
            render: (signedLogoPath) => (
                signedLogoPath ? <Image src={signedLogoPath} alt="Product Icon" className="h-10 w-10 object-cover" width={100} height={100}/> : 'No Image'
            )
        },
        { key: 'title', title: 'Title' },
        { key: 'monthlyPrice', title: 'Monthly Price ($)' },
        { key: 'annualPrice', title: 'Annual Price ($)' },
        { key: 'directDiscount', title: 'Discount (%)' },
        {
            key: 'labelFeatures',
            title: 'Features',
            render: (labelFeatures) => labelFeatures?.join(', ') // Rendering array of features as a comma-separated string
        },
        {
            key: 'action',
            title: 'Actions',
            render: (text, record) => (
                <>
                    <Link href={`/admin/products/${record.id}`}>
                        <Button label="View" color={'green'}/>
                    </Link>
                    <Link href={`/admin/products/${record.id}/edit`}>
                        <Button label="Edit" color={'blue'}/>
                    </Link>

                    <Button
                        label="Delete"
                        color={'red'}
                        onClick={() => handleDelete(record.id)}
                    />
                </>
            )
        },

    ];

    const data = products.map(product => ({
        id: product.id,
        title: product.title,
        signedLogoPath: product.signedLogoPath,
        monthlyPrice: product.monthlyPrice,
        annualPrice: product.annualPrice,
        directDiscount: product.directDiscount,
        labelFeatures: product.labelFeatures,
    }));

    return (
        <Panel title={'Products'} buttonLink={'/admin/products/create'} buttonLabel={'Create New Product'} darkMode={true}>
            <Table columns={columns} data={data}/>
        </Panel>
    );
};

export default IndexProductPage;
