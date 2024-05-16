import Api from "./api";

export class GuestApi extends Api {

    static async create(data) {
        const response = await fetch(`${this.baseUrl}/api/guests/upload`, {
            method: 'POST',
            headers: this.getHeaders({}),
            body: data,
        });
        if(!response.ok) {
            throw new Error('Error while creating stream');
        }
        return await response.json();
    }

}