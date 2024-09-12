'use client';
import React, { useEffect, useState } from 'react';
import Table from '#components/table/Table';
import Button from '#components/_forms/Button';
import { useRouter } from 'next/navigation';
import {useAuthStore} from "#stores/useAuthStore.js";
import Link from "next/link";
import OrderAdminApi from "#api/admin/order.js";

export default function OrdersAdminIndexPage() {
    const [orders, setOrders] = useState([]);
    const { user } = useAuthStore();
    const router = useRouter();

    // Colonnes de la table
    const columns = [
        { key: 'orderId', title: 'Order ID' },
        { key: 'productName', title: 'Product Name' },
        { key: 'userName', title: 'User Name' },
        { key: 'status', title: 'Status' },
        { key: 'createdAt', title: 'Order Date' },
        { key: 'totalAmount', title: 'Total Amount' },
    ];

    // Charger toutes les commandes pour l'admin
    useEffect(() => {
        const fetchOrdersForAdmin = async () => {
            try {
                const data = await OrderAdminApi.getAll()
                setOrders(data.orders);
            } catch (error) {
                console.error('Failed to fetch admin orders:', error);
            }
        };

        if (user?.role.name === 'admin') {
            fetchOrdersForAdmin();
        } else {
            router.push('/'); // Redirige si l'utilisateur n'est pas admin
        }
    }, [user, router]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Orders</h1>
                    <Link href="/admin/orders/create">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Create New Order
                        </button>
                    </Link>
                </header>

                <hr className="border-b-1 border-blueGray-300 pb-6"/>

                <div className="p-6">
                    {orders.length === 0 ? (
                        <p className="text-center text-white">No orders found.</p>
                    ) : (
                        <Table
                            columns={columns}
                            data={orders.map(order => ({
                                orderId: order.id,
                                productName: order.product.title,
                                userName: `${order.user.userName}`,
                                status: order.status,
                                createdAt: new Date(order.createdAt).toLocaleDateString(),
                                totalAmount: `${orders.currency} ${order.totalAmount.toFixed(2)}`,
                            }))}
                            darkMode={true}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
