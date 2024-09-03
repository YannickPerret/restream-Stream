'use client'
import React, { useEffect } from 'react';
import Link from 'next/link';
import useProductStore from '#stores/useProductStore';
import Table from '#components/table/Table';

const IndexProductPage = () => {
    const { fetchProducts, products } = useProductStore();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const columns = [
        { key: 'title', title: 'Title' },
        { key: 'monthlyPrice', title: 'Monthly Price ($)' },
        { key: 'annualPrice', title: 'Annual Price ($)' },
        { key: 'directDiscount', title: 'Discount (%)' },
        {
            key: 'features',
            title: 'Features',
            render: (features) => features.join(', ') // Rendering array of features as a comma-separated string
        },
        {
            key: 'action',
            title: 'Actions',
            render: (text, record) => (
                <Link href={`/admin/products/${record.id}`}>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-lg">
                        View
                    </button>
                </Link>
            )
        },
    ];

    const data = products.map(product => ({
        id: product.id,
        title: product.title,
        monthlyPrice: product.monthlyPrice,
        annualPrice: product.annualPrice,
        directDiscount: product.directDiscount,
        features: product.features,
    }));

    return (
        <div className="container mx-auto py-12 text-white">
            <h1 className="text-3xl font-bold mb-6">Products</h1>
            <div className="flex justify-end mb-4">
                <Link href="/admin/products/create">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                        Create New Product
                    </button>
                </Link>
            </div>
            <Table columns={columns} data={data} />
        </div>
    );
};

export default IndexProductPage;
