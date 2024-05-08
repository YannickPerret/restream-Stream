import Api from "./api";

export class SearchApi extends Api {

    static async search(data) {
        const response = await fetch(`${this.baseUrl}/api/search?domain=${data.domain}&query=${data.query}`, {
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
}