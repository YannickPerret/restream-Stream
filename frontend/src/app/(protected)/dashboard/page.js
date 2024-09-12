'use client'
import DashboardCard from "#components/dashboard/Card";
import {useAuthStore} from "#stores/useAuthStore";
import Table from "#components/table/Table";
import React from "react";

export default function DashBoard(){
    const {user} = useAuthStore()

    const columns = [
        { key: 'source', title: 'Source' },
        { key: 'visitors', title: 'Visitors' },
        { key: 'revenues', title: 'Revenues' },
        { key: 'conversion', title: 'Conversion' },
    ];

    const data = [
        { source: 'Google', visitors: '3.5K', revenues: '$5,768', conversion: '4.8%' },
        { source: 'Twitter', visitors: '2.2K', revenues: '$4,635', conversion: '4.3%' },
        { source: 'YouTube', visitors: '2.1K', revenues: '$4,290', conversion: '3.7%' },
        { source: 'Vimeo', visitors: '1.5K', revenues: '$3,580', conversion: '2.5%' },
        { source: 'Facebook', visitors: '1.2K', revenues: '$2,740', conversion: '1.9%' },
    ];

    return(
        <section className=" min-h-screen bg-white px-8 rounded-lg shadow-lg overflow-hidden">
            <header className=" py-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">Welcom {user?.username}</h1>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">

                {/* Top Channels Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Your active streams</h2>
                    <DashboardCard>
                        <Table columns={columns} data={data} />
                    </DashboardCard>
                </section>


                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Highlights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DashboardCard title="Avg. Client Rating">
                            <p className="text-3xl font-bold">7.8/10</p>
                            <p className="text-sm text-green-500">+2.5% than last week</p>
                        </DashboardCard>
                        <DashboardCard title="Instagram Followers">
                            <p className="text-3xl font-bold">7.8/10</p>
                            <p className="text-sm text-red-500">-1.5% than last week</p>
                        </DashboardCard>
                        <DashboardCard title="Avg. Client Spending">
                            <p className="text-3xl font-bold">$5.03</p>
                            <p className="text-sm text-green-500">+2.6% than last week</p>
                        </DashboardCard>
                    </div>
                </section>



                {/* Campaign Visitors */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">Campaign Visitors</h2>
                    <DashboardCard>
                        <p className="text-3xl font-bold">784k</p>
                        <p className="text-sm text-red-500">-1.5% since last week</p>
                        <div className="mt-4">
                            <p>Graphique de visiteurs ici</p>
                        </div>
                    </DashboardCard>
                </section>
            </div>
        </section>
    )
}