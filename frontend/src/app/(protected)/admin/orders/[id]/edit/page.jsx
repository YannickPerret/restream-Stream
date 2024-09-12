'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Pour récupérer l'ID de la commande
import { OrderApi } from '#api/order'; // Assurez-vous que cette API fonctionne pour récupérer une commande
import Input from '#components/_forms/Input';
import Button from '#components/_forms/Button';
import { useAuthStore } from '#stores/useAuthStore'; // Pour vérifier si l'utilisateur est admin
import { useRouter } from 'next/navigation';

export default function OrderEditPage() {
    const { id } = useParams(); // Récupérer l'ID de la commande à partir de l'URL
    const [order, setOrder] = useState(null); // État pour stocker les détails de la commande
    const { user } = useAuthStore(); // Récupérer l'utilisateur connecté
    const [isAdmin, setIsAdmin] = useState(false); // État pour stocker si l'utilisateur est admin ou non
    const router = useRouter();

    // État pour les modifications
    const [status, setStatus] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);

    // Charger les détails de la commande et vérifier le rôle
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderApi.getOne(id);
                setOrder(data.order);
                setStatus(data.order.status);
                setTotalAmount(data.order.total_amount);

                // Vérifier si l'utilisateur a un rôle d'admin
                if (user?.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    router.push('/orders'); // Redirige si l'utilisateur n'est pas admin
                }
            } catch (error) {
                console.error('Failed to fetch order details:', error);
            }
        };

        fetchOrder();
    }, [id, user, router]);

    // Mettre à jour la commande
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const updatedOrder = {
                status,
                total_amount: totalAmount,
            };

            await OrderApi.update(id, updatedOrder);
            router.push(`/orders/${id}`);
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    if (!isAdmin) {
        return <p className="text-center text-white">You do not have permission to edit this order.</p>;
    }

    if (!order) {
        return <p className="text-center text-white">Loading order details...</p>;
    }

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Edit Order (ID: {id})</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />

                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <Input
                                label="Status"
                                type="text"
                                placeholder="Enter Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            />

                            <Input
                                label="Total Amount"
                                type="number"
                                placeholder="Enter Total Amount"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button label="Cancel" onClick={() => router.push(`/orders/${id}`)} color="red" />
                            <Button label="Save Changes" type="submit" color="blue" />
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
