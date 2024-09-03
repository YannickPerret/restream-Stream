'use client'
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useProductStore from '#stores/useProductStore';

const ShowProductPage = () => {
    const { id } = useParams();
    const { getProduct, product } = useProductStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            await getProduct(id);
            setLoading(false);
        };

        fetchProduct();
    }, [id, getProduct]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="container mx-auto py-12 text-white">
            <h1 className="text-3xl font-bold mb-6">{product.title}</h1>
            <p>Monthly Price: ${product.monthlyPrice}</p>
            <p>Annual Price: ${product.annualPrice}</p>
            <p>Discount: {product.directDiscount}%</p>
            <h3 className="mt-4">Features:</h3>
            <ul className="list-disc ml-5">
                {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
        </div>
    );
};

export default ShowProductPage;
