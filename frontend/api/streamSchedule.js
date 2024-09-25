
import Api from "./api";

export class StreamScheduleApi extends Api {

    static async getAll() {
        const response = await fetch(`${this.baseUrl}/api/streams/schedules`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while fetching schedule streams');
        }
        return await response.json();
    }

    static async create(data) {
        const response = await fetch(`${this.baseUrl}/api/streams/schedules`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if(!response.ok) {
            throw new Error('Error while creating schedule stream');
        }
        return await response.json();
    }
}