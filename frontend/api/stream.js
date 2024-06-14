import Api from "./api";

export class StreamApi extends Api {

    static async getAll() {
        const response = await fetch(`${this.baseUrl}/api/streams`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching streams');
        }
        return await response.json();
    }

    static async getOne(id) {
        const response = await fetch(`${this.baseUrl}/api/streams/${id}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while fetching stream');
        }
        return await response.json();
    }

    static async create(data) {
        const response = await fetch(`${this.baseUrl}/api/streams`, {
            method: 'POST',
            headers: this.getHeaders({}),
            body: data,
        });
        if(!response.ok) {
            throw new Error('Error while creating stream');
        }
        return await response.json();
    }

    static async update(id, data) {
        const response = await fetch(`${this.baseUrl}/api/streams/${id}`, {
            method: 'PUT',
            headers: this.getHeaders({}),
            body: data,
        });
        if(!response.ok) {
            throw new Error('Error while updating stream');
        }
        return await response.json();
    }

    static async delete(id) {
        const response = await fetch(`${this.baseUrl}/api/streams/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while deleting stream');
        }
    }

    static async start(id) {
        const response = await fetch(`${this.baseUrl}/api/streams/${id}/start`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while starting stream');
        }
        return await response.json();
    }

    static async stop(id) {
        const response = await fetch(`${this.baseUrl}/api/streams/${id}/stop`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while stopping stream');
        }
        return await response.json();
    }

    static async restart(id) {
        const response = await fetch(`${this.baseUrl}/api/streams/${id}/restart`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
        if(!response.ok) {
            throw new Error('Error while restarting stream');
        }
        return await response.json();
    }
}