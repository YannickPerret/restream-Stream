import Api from '../api';

export default class SubscriptionAdminApi extends Api {
    static async getAll() {
        const response = await fetch(`${this.baseUrl}/api/subscriptions`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching subscriptions');
        }
        return await response.json();
    }

    static async getByFilter(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${this.baseUrl}/api/subscriptions?${queryParams}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching subscriptions');
        }
        return await response.json();
    }

    static async getOne(id) {
        const response = await fetch(`${this.baseUrl}/api/subscriptions/${id}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Error while fetching subscriptions');
        }
        return await response.json();
    }

    static async create(data) {
        const response = await fetch(`${this.baseUrl}/api/subscriptions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Error while creating subscriptions');
        }
        return await response.json();
    }

    static async update(id, data) {
        const response = await fetch(`${this.baseUrl}/api/subscriptions/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Error while updating subscriptions');
        }
        return await response.json();
    }

    static async delete(id) {
        const response = await fetch(`${this.baseUrl}/api/subscriptions/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Error while deleting subscriptions');
        }
    }


    /***** Admin mode ****/
    static async getAllByAdmin() {
        const response = await fetch(`${this.baseUrl}/api/admin/subscriptions`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching subscriptions');
        }
        return await response.json();
    }

}
