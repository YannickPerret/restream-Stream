'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useProductStore from '#stores/useProductStore';
import Link from "next/link.js";
import {ArrowLeft} from "lucide-react";

const ShowProductPage = () => {
    const { id } = useParams();
    const { fetchProductById } = useProductStore();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            const fetchedProduct = await fetchProductById(id);
            setProduct(fetchedProduct);
            setLoading(false);
        };

        fetchProduct();
    }, [id, fetchProductById]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">{product.title}</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                    <div>
                        <Link href={"/admin/products"} className={"flex"}><ArrowLeft />&nbsp; Back to product</Link>
                    </div>
                </header>

            <p>Monthly Price: ${product.monthlyPrice}</p>
            <p>Annual Price: ${product.annualPrice}</p>
            <p>Discount: {product.directDiscount}%</p>
            <p>Label Features: {Array.isArray(product.labelFeatures) ? product.labelFeatures.join(', ') : product.labelFeatures}</p>
            <h3 className="mt-4">Features:</h3>
            <ul className="list-disc ml-5">
                {product.features.map((feature, index) => (
                    <li key={index}>
                        {feature.name}: {feature.pivotValue}
                    </li>
                ))}
            </ul>
        </div>
        </section>

    );
};

export default ShowProductPage;
