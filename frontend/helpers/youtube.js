'use client'
export const fetchToken = async (code) => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'client_id': process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID,
            'client_secret': process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_SECRET,
            code,
            'redirect_uri': `${window.location.origin}/providers/create/callback/youtube`,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch tokens: ${errorData.error} - ${errorData.error_description}`);
    }

    const data = await response.json();

    return data
}

export const getBroadcasts = async (accessToken) => {
    try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=id,snippet,contentDetails,status&broadcastStatus=all', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            // Filtrer les diffusions pour exclure celles qui ont le statut "completed"
            const activeBroadcasts = data.items.filter(broadcast => broadcast.status.lifeCycleStatus !== 'complete');
            return { ...data, items: activeBroadcasts };
        } else {
            console.error('No active live broadcast found.');
            return [];
        }
    } catch (error) {
        console.error('Error fetching broadcasts:', error.message);
        throw error;
    }
};

export const fetchStreamId = async (accessToken, broadcastId) => {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts?part=contentDetails&id=${broadcastId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        });

        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].contentDetails.boundStreamId;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching stream ID:', error.message);
        throw error;
    }
};

export const fetchStreamKey = async (accessToken, streamId, retries = 3, delay = 2000) => {
    try {
        for (let i = 0; i < retries; i++) {
            const streamResponse = await fetch(`https://www.googleapis.com/youtube/v3/liveStreams?part=cdn&id=${streamId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            });

            const streamData = await streamResponse.json();

            if (streamData.items && streamData.items.length > 0) {
                return streamData.items[0].cdn.ingestionInfo.streamName;
            } else {
                console.warn(`No stream key found, retrying... (${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
            }
        }

        throw new Error('No stream key found for the given stream.');
    } catch (error) {
        console.error('Error fetching stream key:', error.message);
        throw error;
    }
};

export const createLiveStream = async (accessToken, title) => {
    try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/liveStreams?part=id,snippet,cdn,contentDetails,status', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                snippet: {
                    title: title || 'New Live Stream',
                },
                cdn: {
                    resolution: '1080p', // Spécifiez la résolution ici (ex: 1080p, 720p, etc.)
                    frameRate: '30fps', // Spécifiez le frame rate (ex: 30fps, 60fps)
                    format: '1080p',
                    ingestionType: 'rtmp',
                },
                status: {
                    privacyStatus: 'public',
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error(`Failed to create live stream: ${data.error.message}`);
            throw new Error(`Failed to create live stream: ${data.error.message}`);
        }

        console.log('Live Stream created successfully:', data);
        return data;
    } catch (error) {
        console.error('Error creating live stream:', error.message);
        throw error;
    }
};

// Créer un nouveau flux en direct
export const createLiveBroadcast = async (accessToken, title) => {
    try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=id,snippet,contentDetails,status', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                snippet: {
                    title: title || 'New Live Broadcast',
                    scheduledStartTime: new Date().toISOString(),
                    description: 'This is a live broadcast',
                },
                status: {
                    privacyStatus: 'public',
                    selfDeclaredMadeForKids: true,
                },
                contentDetails: {
                    monitorStream: { enableMonitorStream: true },
                    enableAutoStart: true,  // Désactiver le démarrage automatique
                    enableAutoStop: false
                }
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error(`Failed to create live broadcast: ${data.error.message}`);
            throw new Error(`Failed to create live broadcast: ${data.error.message}`);
        }

        console.log('Live Broadcast created successfully:', data);
        return data;
    } catch (error) {
        console.error('Error creating live broadcast:', error.message);
        throw error;
    }
};

export const bindLiveStreamToBroadcast = async (accessToken, broadcastId, streamId) => {
    try {
        if (!broadcastId || !streamId) {
            throw new Error('Both broadcastId and streamId are required.');
        }

        console.log(broadcastId, streamId)

        const response = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id,snippet,contentDetails&id=${broadcastId}&streamId=${streamId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`Failed to bind stream to broadcast: ${data.error.message}`);
            throw new Error(`Failed to bind stream to broadcast: ${data.error.message}`);
        }

        console.log('Stream successfully bound to broadcast:', data);
        return data;
    } catch (error) {
        console.error('Error binding stream to broadcast:', error.message);
        throw error;
    }
};
