'use client'
import {useVideoStore} from "#stores/useVideoStore.js";
import {getDurationInFormat} from "#helpers/time.js";
import VideoPreview from "#components/videos/preview.jsx";

export default function VideosShowView(){
    const video = useVideoStore.use.selectedVideo();

    if(!video) {
        return <div className="p-4">Loading...</div>
    }
    console.log(video)
    return(
        <div className="p-4">
            <div className="shadow-md rounded p-4">
                <h2 className="text-xl font-semibold">Stream name : {video.title}</h2>
                <p>
                    Video description : {video.description}
                </p>
                <p>Video duration : {getDurationInFormat(video.duration)}</p>
                <p>Video show in live : {video.showInLive}</p>
                <p>Video status : {video.status}</p>
                {video.guest ? (
                    <>
                        {video.user && <span>Validate by: {video.user?.fullName}</span>}<br />
                        {video.guest && <span>Upload by Guest: {video.guest.displayName}</span>}
                    </>
                ) : (
                    <span>Upload by: {video.user.fullName}</span>
                )}
            </div>

            <div className="shadow-md rounded p-4">
                <VideoPreview videoUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/videos/${video.id}/serve`} />
            </div>

        </div>
    )
}