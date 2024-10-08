'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Button from '#components/_forms/Button';
import { useRouter } from 'next/navigation';
import OrderApi from "#api/order.js";

export default function OrderShowPage() {
    const { slug } = useParams();
    const [order, setOrder] = useState(null);
    const router = useRouter();

    // Charger les détails de la commande
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderApi.getOneBySlug(slug)
                setOrder(data.order);
            } catch (error) {
                console.error('Failed to fetch order details:', error);
            }
        };

        fetchOrder();
    }, [id]);

    if (!order) {
        return <p className="text-center text-white">Loading order details...</p>;
    }

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Order Details (ID: {id})</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />

                    {/* Affichage des détails de la commande */}
                    <div className="p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Product: {order.product.title}</h2>
                            <p className="mt-2">Status: <strong>{order.status}</strong></p>
                            <p className="mt-2">Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                            <p className="mt-2">Total Amount: <strong>${order.total_amount.toFixed(2)}</strong></p>
                        </div>

                        {/* Bouton pour revenir à la liste des commandes */}
                        <Button label="Back to Orders" onClick={() => router.push('/orders')} color="blue" />
                    </div>
                </div>
            </div>
        </section>
    );
}
