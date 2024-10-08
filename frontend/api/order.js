import Api from './api';

export default class OrderApi extends Api {
    static async getAll() {
        const response = await fetch(`${this.baseUrl}/api/orders`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching orders');
        }
        return await response.json();
    }

    static async getAllByAdmin() {
        const response = await fetch(`${this.baseUrl}/api/admin/orders`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching admin orders');
        }
        return await response.json();
    }

    static async getOne(id) {
        const response = await fetch(`${this.baseUrl}/api/orders/${id}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while fetching orders');
        }
        return await response.json();
    }

    static async getOneBySlug(slug) {
        const response = await fetch(`${this.baseUrl}/api/orders/slug/${slug}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while fetching orders');
        }
        return await response.json();
    }

    static async create(data) {
        const response = await fetch(`${this.baseUrl}/api/orders`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if(!response.ok) {
            throw new Error('Error while creating orders');
        }
        return await response.json();
    }

    static async update(id, data) {
        const response = await fetch(`${this.baseUrl}/api/orders/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if(!response.ok) {
            throw new Error('Error while updating orders');
        }
        return await response.json();
    }

    static async delete(id) {
        const response = await fetch(`${this.baseUrl}/api/orders/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while deleting orders');
        }
    }

    static async renewSubscription(data){
        const response = await fetch(`${this.baseUrl}/api/orders/renew-subscription`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if(!response.ok) {
            throw new Error('Error while renewing subscription');
        }
        return await response.json();
    }

    static async downloadInvoice(id) {
        const response = await fetch(`${this.baseUrl}/api/orders/${id}/download/invoice`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Error while downloading invoice');
        }
        return response;
    }
}
