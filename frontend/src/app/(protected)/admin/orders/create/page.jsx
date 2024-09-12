'use client';
import React, {useEffect, useState} from 'react';
import Input from '#components/_forms/Input';
import Select from '#components/_forms/Select';
import Button from '#components/_forms/Button';
import { OrderApi } from '#api/order'; // L'API pour créer des commandes
import { useRouter } from 'next/navigation';
import {useAuthStore} from "#stores/useAuthStore.js";

export default function OrderCreatePage() {
    const [products, setProducts] = useState([{ productId: '', quantity: 1 }]); // Gérer les produits et quantités
    const [paymentStatus, setPaymentStatus] = useState('pending'); // Statut du paiement par défaut
    const [totalAmount, setTotalAmount] = useState(0);
    const {user} = useAuthStore();
    const router = useRouter();

    // Ajout d'un nouveau produit à la commande
    const addProduct = () => {
        setProducts([...products, { productId: '', quantity: 1 }]);
    };

    // Mise à jour d'un produit existant
    const updateProduct = (index, field, value) => {
        const updatedProducts = products.map((product, i) => (
            i === index ? { ...product, [field]: value } : product
        ));
        setProducts(updatedProducts);
    };

    // Soumission du formulaire
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Calcul du montant total
        const calculatedTotal = products.reduce((acc, product) => acc + product.quantity * 10, 0); // Juste un exemple, tu devrais calculer avec les prix réels des produits
        setTotalAmount(calculatedTotal);

        const orderData = {
            items: products,
            totalAmount: calculatedTotal,
            status: 'pending', // On peut aussi choisir le statut de la commande
            paymentStatus,
        };

        try {
            await OrderApi.create(orderData);
            router.push('/orders'); // Rediriger vers la page des commandes après la création
        } catch (error) {
            console.error('Failed to create order:', error);
        }
    };

    useEffect(() => {
        if(user.role.name !== 'admin') {
            router.push('/');
        }
    }, []);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Create a New Order</h1>
                </div>
                <hr className="border-b-1 border-blueGray-300 pb-6" />

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {/* Gestion des produits */}
                        <h2 className="text-xl text-white">Order Items</h2>
                        {products.map((product, index) => (
                            <div key={index} className="space-y-2">
                                <Input
                                    label={`Product ID ${index + 1}`}
                                    type="text"
                                    placeholder="Enter product ID"
                                    value={product.productId}
                                    onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                                    required
                                />
                                <Input
                                    label="Quantity"
                                    type="number"
                                    placeholder="Enter quantity"
                                    value={product.quantity}
                                    onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                                    required
                                />
                            </div>
                        ))}
                        <Button label="Add Another Product" onClick={addProduct} color="blue" />

                        {/* Sélection du statut du paiement */}
                        <Select
                            label="Payment Status"
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'failed', label: 'Failed' },
                                { value: 'refunded', label: 'Refunded' },
                            ]}
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            required
                        />

                        {/* Montant total calculé */}
                        <p className="text-white">Total Amount: ${totalAmount}</p>

                        {/* Soumettre le formulaire */}
                        <div className="flex justify-end space-x-4">
                            <Button label="Create Order" type="submit" color="green" />
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}
