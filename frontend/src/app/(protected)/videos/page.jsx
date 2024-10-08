'use client'
import { useEffect, useState } from "react";
import { useVideoStore } from "#stores/useVideoStore";
import VideoIndexView from "@/views/videos";
import Link from "next/link";
import AuthApi from "#api/auth.js";
import {useAuthStore} from "#stores/useAuthStore.js";
import Panel from "#components/layout/panel/Panel.jsx";
import VideoFormatter from "#libs/VideoFormatage.js";

export default function VideosIndexPage() {
    const getVideos = useVideoStore.use.fetchVideos();
    const videos = useVideoStore.use.videos();

    const [maxVideoStorage, setMaxVideoStorage] = useState(5000);
    const [currentVideoStorage, setCurrentVideoStorage] = useState(0);
    const [isStorageExceeded, setIsStorageExceeded] = useState(false);
    const {setSubscriptions, setUser, user } = useAuthStore()


    useEffect(() => {
        const fetchVideos = async () => {
            await getVideos();
        };

        const _fetchUserData = async () => {
            await AuthApi.getCurrentUser().then((data) => {
                setUser(data.user)
                // Récupérer les souscriptions
                setSubscriptions(data.subscriptions);

                // Chercher la feature 'max_stream_instance' dans la première souscription
                const maxStreamFeature = data.subscriptions[0]?.features?.find(
                    (feature) => feature.name === 'max_video_storage'
                );

                // S'assurer que la feature et sa valeur existent
                if (maxStreamFeature && maxStreamFeature.values && maxStreamFeature.values.length > 0) {
                    setMaxVideoStorage(maxStreamFeature.values[0]);
                } else {
                    setMaxVideoStorage(0);
                }
            })
                .catch((e) => {
                    console.error(e)
                })
        }

        fetchVideos();
        _fetchUserData();
    }, []);

    useEffect(() => {
        const totalStorage = videos.reduce((acc, video) => acc + video.size, 0);
        setCurrentVideoStorage(totalStorage);

        if (totalStorage >= maxVideoStorage) {
            setIsStorageExceeded(true);
        }
       else if(totalStorage === 0 && maxVideoStorage > 0) {
            setIsStorageExceeded(false);
        }
        else {
            setIsStorageExceeded(false);
        }
    }, [videos, maxVideoStorage]);

    return (
        <Panel title={'Your Videos'} buttonLabel={'Create New Video'} buttonLink={'/videos/create'} buttonDisable={isStorageExceeded} darkMode={true}>
            <div className="mb-4">
                <p>Current Storage: {VideoFormatter.formatSize(currentVideoStorage)}  / {VideoFormatter.formatSize(maxVideoStorage)}</p>
            </div>

            <hr className="border-b-1 border-blueGray-300 pb-6"/>
            <VideoIndexView />
        </Panel>
    );
}
