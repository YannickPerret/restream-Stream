// frontend/src/components/YouTube/YouTubeLoginButton.jsx

export default function YouTubeLoginButton({ onSuccess }) {
    const handleYouTubeLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
        const redirectUri = `${window.location.origin}/providers/create/callback/youtube`;
        const scope = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl';

        console.log(clientId)
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;

        window.location.href = authUrl;
    };

    return (
        <button
            onClick={handleYouTubeLogin}
            className="bg-red-600 text-white px-4 py-2 rounded-md"
        >
            Connect YouTube
        </button>
    );
}
