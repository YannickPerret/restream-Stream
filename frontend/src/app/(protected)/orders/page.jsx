'use client';
import React, { useEffect } from 'react';
import Table from '#components/table/Table';
import useOrderStore from "#stores/useOrderStore";
import { useAuthStore } from "#stores/useAuthStore.js";
import Panel from "#components/layout/panel/Panel.jsx";
import Link from "next/link";
import Button from "#components/_forms/Button.jsx";
import orderApi from "#api/order.js";

export default function OrdersIndexPage() {
    const { user } = useAuthStore();
    const { orders, fetchOrders, setOrderData } = useOrderStore();

    const activeColumns = [
        { key: 'orderId', title: 'Order ID' },
        { key: 'productName', title: 'Product Name(s)' },
        { key: 'status', title: 'Status' },
        { key: 'createdAt', title: 'Order Date' },
        { key: 'totalAmount', title: 'Total Amount to Pay' },
        { key: 'actions', title: 'Actions', render: (_, row) => (
            <Link href={`/orders/${row.slug}/checkout`}>
                <Button label={'Pay Now'} color={'green'} />
            </Link>
        )},
    ];

    const completedColumns = [
        { key: 'orderId', title: 'Order ID' },
        { key: 'productName', title: 'Product Name(s)' },
        { key: 'status', title: 'Status' },
        { key: 'createdAt', title: 'Order Date' },
        { key: 'totalAmount', title: 'Total Amount' },
        { key: 'actions', title: 'Actions', render: (_, row) => (
                <Link href={`${orderApi.baseUrl}/invoice/pdf/${row.slug}`} download>
                    <Button label={'Download invoice'} color={'blue'}/>
                </Link>
            )
        },
    ];

    useEffect(() => {
        const _fetchOrders = async () => {
            try {
                const orderReponse = await fetchOrders();
                setOrderData(orderReponse);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };

        if (user) {
            _fetchOrders();
        }
    }, [user, fetchOrders]);

    const handleInvoiceDownload = async (slug) => {
        try {
            await orderApi.downloadInvoice(slug);
        }
        catch (e) {
            console.error('Failed to download invoice:', e);
        }
    }

    // Separate orders by status
    const activeOrders = [];
    const completedOrders = [];

    if (Array.isArray(orders) && orders.length > 0) {
        orders.forEach(order => {
            const formattedOrder = {
                orderId: order.id,
                productName: order.items.map(item => item.product.title).join(', '),
                status: order.status,
                createdAt: new Date(order.createdAt).toLocaleDateString(),
                totalAmount: `${order.currency.toUpperCase()} ${order.totalAmount.toFixed(2)}$`,
                slug: order.slug,
            };

            // Separate active/waiting orders from completed/cancelled/finished
            if (['active', 'waiting', 'pending'].includes(order.status)) {
                activeOrders.push(formattedOrder);
            } else if (['completed', 'cancelled', 'finished'].includes(order.status)) {
                completedOrders.push(formattedOrder);
            }
        });
    }

    return (
        <Panel title="Your Orders" darkMode={true}>
                <>
                    <h2 className="text-white text-xl mb-4">Active Orders</h2>
                    <Table
                        columns={activeColumns}
                        data={activeOrders}
                        darkMode={false}
                    />
                </>

            {completedOrders.length > 0 && (
                <>
                    <h2 className="text-white text-xl mt-8 mb-4">Completed / Cancelled Orders</h2>
                    <Table
                        columns={completedColumns}
                        data={completedOrders}
                        darkMode={false}
                    />
                </>
            )}

            {activeOrders.length === 0 && completedOrders.length === 0 && (
                <p className="text-center text-white">No orders found.</p>
            )}
        </Panel>
    );
}
