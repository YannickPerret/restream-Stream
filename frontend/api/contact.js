import Api from './api';

export default class ContactApi extends Api {
       static async send(data) {
           const response = await fetch(`${this.baseUrl}/api/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Error while sending the contact');
        }
        return await response.json();
    }
}
