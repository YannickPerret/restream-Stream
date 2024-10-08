'use client';
import React, { useEffect } from 'react';
import Table from '#components/table/Table';
import { useUserStore } from '#stores/useUserStore.js';
import Button from "#components/_forms/Button.jsx";
import UserAdminApi from '#api/admin/user.js';
import Panel from "#components/layout/panel/Panel.jsx";

const UserListPage = () => {
    const { users, fetchAllUsers, loading, error } = useUserStore();

    useEffect(() => {
        fetchAllUsers(); // Fetch users on mount
    }, [fetchAllUsers]);

    const handleDelete = async (userId) => {
        try {
            await UserAdminApi.softDelete(userId); // Utilise la méthode soft delete
            fetchAllUsers(); // Rafraîchir la liste des utilisateurs après suppression
        } catch (error) {
            console.error('Error during soft delete:', error);
        }
    };

    const columns = [
        { key: 'username', title: 'Username', render: (value, row) => row.username },
        { key: 'email', title: 'Email', render: (value, row) => row.email },
        { key: 'createdAt', title: 'Created At', render: (value) => new Date(value).toLocaleDateString() },
        { key: 'role', title: 'Role', render: (value, row) => row.role?.name || 'No role assigned' },
        { key: 'lastLoginAt', title: 'Last Login', render: (value) => value ? new Date(value).toLocaleDateString() : 'Never' },
        { key: 'ipAddress', title: 'IP Address', render: (value, row) => row.ipAddress || 'N/A' },
        { key: 'isVerified', title: 'Verified', render: (value, row) => row.isVerified ? 'Yes' : 'No' },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, row) => (
                <>
                    <Button label="View" onClick={() => console.log('View User', row.id)} color="green" />
                    <Button label="Edit" onClick={() => console.log('Edit User', row.id)} color={"blue"} />
                    <Button
                        label="Delete"
                        variant="delete"
                        onClick={() => handleDelete(row.id)}
                        color="red"
                    />
                </>
            ),
        },
    ];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Panel
            title="Users"
            darkMode={true}
            buttonLink="/admin/subscriptions/create"
            buttonLabel="Create New Subscription"
        >
            <Table columns={columns} data={users} />
        </Panel>
    );
};

export default UserListPage;
