import Api from './api';

export default class TwitchApi extends Api {
    static async saveTokens(data) {
        const response = await fetch(`${this.baseUrl}/providers/twitch/tokens`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Error while saving Twitch tokens');
        }
        return await response.json();
    }
}
