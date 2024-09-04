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
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl p-8 bg-gradient-to-r from-indigo-900 via-gray-900 to-black">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Products</h1>
                        <Link href="/admin/products/create">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                                Create New Product
                            </button>
                        </Link>
                </header>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>

                <Table columns={columns} data={data}/>
            </div>
        </section>
    );
};

export default IndexProductPage;
