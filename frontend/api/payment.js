import Api from './api';

export default class PaymentApi extends Api {
    static async getAll() {
        const response = await fetch(`${this.baseUrl}/api/payments`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching payments');
        }
        return await response.json();
    }

    static async getOne(id) {
        const response = await fetch(`${this.baseUrl}/api/payments/${id}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while fetching payments');
        }
        return await response.json();
    }

    static async create(data) {
        const response = await fetch(`${this.baseUrl}/api/payments`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if(!response.ok) {
            throw new Error('Error while creating payments');
        }
        return await response.json();
    }

    static async update(id, data) {
        const response = await fetch(`${this.baseUrl}/api/payments/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if(!response.ok) {
            throw new Error('Error while updating payments');
        }
        return await response.json();
    }

    static async delete(id) {
        const response = await fetch(`${this.baseUrl}/api/payments/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while deleting payments');
        }
    }
}
