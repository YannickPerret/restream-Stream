import Api from './api';

export default class DiscountApi extends Api {
    static async apply(data) {
        const response = await fetch(`${this.baseUrl}/api/discounts/apply`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error status:', response.status, 'Error body:', errorBody);
            throw new Error('Error while apply discount');
        }
        return await response.json();
    }
}
