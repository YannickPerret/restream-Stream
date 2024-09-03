'use client'
import React, { useEffect } from 'react';
import useProductStore from '#stores/useProductStore.js';

const ProductsList = () => {
    const products = useProductStore((state) => state.products);
    const loadProducts = useProductStore((state) => state.loadProducts);

    useEffect(() => {
        // Charger les produits depuis une API ou un fichier local
        const fetchProducts = async () => {
            const response = await fetch('/api/products');
            const data = await response.json();
            loadProducts(data);
        };
        fetchProducts();
    }, [loadProducts]);

    return (
        <div>
            <h1>Products</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <h2>{product.name}</h2>
                        <p>{product.description}</p>
                        <p>Price: {product.price}</p>
                        <button onClick={() => useProductStore.getState().addToCart(product)}>
                            Add to Cart
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductsList;
