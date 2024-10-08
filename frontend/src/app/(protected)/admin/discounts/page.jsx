'use client';
import React, { useEffect, useState } from 'react';
import Table from '#components/table/Table';
import Link from "next/link.js";
import DiscountApi from "#api/admin/discount.js";

const DiscountIndex = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Colonnes du tableau
    const columns = [
        { key: 'name', title: 'Name' },
        { key: 'description', title: 'Description' },
        { key: 'amount', title: 'Amount' },
        { key: 'type', title: 'Type' },
        { key: 'isCombinable', title: 'Combinable' },
        { key: 'scope', title: 'Scope' },
        { key: 'startDate', title: 'Start Date' },
        { key: 'endDate', title: 'End Date' },

    ];

    const fetchDiscounts = async () => {
        try {
            const data = await DiscountApi.getAll();

            // Transformation des données pour inclure les informations de scope
            const transformedDiscounts = data.map(discount => ({
                ...discount,
                scope: discount.products && discount.products.length > 0
                    ? discount.products.map(product => product.name).join(', ') // Afficher les produits associés
                    : 'Orders' // Afficher "Orders" si pas de produits associés
            }));

            setDiscounts(transformedDiscounts);
        } catch (error) {
            console.error('Failed to fetch discounts', error);
        } finally {
            setLoading(false);
        }
    };

    // Appel de l'API lors du montage du composant
    useEffect(() => {
        fetchDiscounts();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-white">Discounts</h1>
                    <Link href="/admin/discounts/create">
                        <button  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Create New Discount
                        </button>
                    </Link>
                </header>

                <hr className="border-b-1 border-blueGray-300 pb-6"/>
                <Table columns={columns} data={discounts} darkMode={false} />
            </div>
        </section>
    );
};

export default DiscountIndex;
