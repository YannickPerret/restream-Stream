import Provider from '#models/providers/provider';

export default class YouTube extends Provider {
  private static instance: YouTube;

  constructor(provider: Provider) {
    super();
    Object.assign(this, provider);
    this.baseUrl = 'rtmp://a.rtmp.youtube.com/live2';
  }

  async changeTitle(title: string | undefined = undefined, attempt: number = 1) {
    if (!title) {
      return;
    }

    try {
      console.log("broadcaster_id", this.broadcasterId);
      console.log("authBearer", this.authBearer);
      // Récupérer les détails actuels du broadcast
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet&id=${this.broadcasterId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.authBearer}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 401 && attempt <= 1) {
        // Token expiré, essayez de le rafraîchir et réessayez
        console.log('Token expired. Attempting to refresh...');
        await this.refreshNewToken();
        return this.changeTitle(title, attempt + 1);
      }

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Failed to fetch current broadcast details:', errorDetails);
        throw new Error('Failed to fetch current broadcast details');
      }

      const broadcastData = await response.json();

      // Modifier le titre du broadcast
      const snippet = {
        ...broadcastData.items[0].snippet, // Inclut tous les autres champs du snippet
        title: title,
      };

      const updateResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet&id=${this.broadcasterId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.authBearer}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: this.broadcasterId,  // Ajoutez explicitement l'ID du broadcast
            snippet: snippet,
          }),
        }
      );

      if (updateResponse.status === 401 && attempt <= 1) {
        // Token expiré, essayez de le rafraîchir et réessayez
        console.log('Token expired during update. Attempting to refresh...');
        await this.refreshNewToken();
        return this.changeTitle(title, attempt + 1);
      }

      if (!updateResponse.ok) {
        const updateErrorDetails = await updateResponse.json();
        console.error('Failed to change title:', updateErrorDetails);
        throw new Error('Failed to change title');
      }

      console.log('Title changed successfully');
    } catch (error) {
      console.error('Error changing title:', error);
      throw new Error('Failed to change title');
    }
  }


  private async verifyToken() {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + this.authBearer);
      const data = await response.json();
      if (data.error || response.status === 401) {
        console.log('Token is invalid, refreshing token...');
        await this.refreshNewToken();
      } else {
        console.log('Token is valid');
      }
    } catch (error) {
      console.error('Failed to verify token:', error);
    }
  }

  private async refreshNewToken() {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Failed to refresh token:', errorDetails);
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.authBearer = data.access_token;
      await this.save();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  static getInstance(): YouTube {
    if (!YouTube.instance) {
      YouTube.instance = new YouTube();
    }
    return YouTube.instance;
  }
}
