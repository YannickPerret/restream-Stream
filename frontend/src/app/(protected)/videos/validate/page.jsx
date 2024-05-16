'use client'
import {useEffect, useState} from "react";
import {VideoApi} from "#api/video.js";
import {useVideoStore} from "#stores/useVideoStore.js";
import Preview from "#components/videos/preview.jsx";
import Modal from "#components/modal/modal.jsx";
import VideoEditForm from "#components/forms/edit/video.jsx";
import {useRouter} from "next/navigation";

export default function VideoValidatePage() {
    const videos = useVideoStore.use.videos()
    const removeVideo = useVideoStore.use.removeVideo();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [videoToEdit, setVideoToEdit] = useState(null);
    const router = useRouter();

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    useEffect(() => {
        const fetchAllVideoValidate = async() => {
            const data = await VideoApi.getAll({status: 'pending'});
            useVideoStore.setState({videos: data});
        }
        fetchAllVideoValidate();
    }, []);

    const handleValidateVideo = async(videoId) => {
        const data = await VideoApi.validate(videoId);
        router.push('/videos/'+videoId);
    }

    const handleRemoveVideo = async(videoId) => {
        const data = await VideoApi.delete(videoId);
        removeVideo(videoId);

    }

    const handleEditVideo = async(videoId) => {
        const video = videos.find((video) => video.id === videoId);
        setVideoToEdit(video);
        openModal();
    }

    return(
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Videos to validate</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>

                </header>

                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.length === 0 && <p className="text-white text-center">No videos to validate</p>}
                        {videos.map((video) => (
                            <article key={video.id} className="bg-white rounded-lg shadow-lg">
                                <header className="rounded-lg shadow-lg">
                                    <Preview videoUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/videos/${video.id}/serve`} />
                                </header>
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold text-gray-700">{video.title}</h2>
                                    <p className="text-sm text-gray-500">Description: {video.description}</p>
                                    <p className="text-sm text-gray-500">Status: {video.status}</p>
                                    <p className="text-sm text-gray-500">Created at: {new Date(video.createdAt).toString()}</p>
                                    <p className="text-sm text-gray-500">Posted by: {video.guest.username}</p>
                                    <p className="text-sm text-gray-500">Name to display: {video.guest.displayName}</p>
                                    <div className="flex justify-end gap-4">
                                        <button onClick={() => handleEditVideo(video.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg">Edit
                                        </button>
                                        <button onClick={() => handleValidateVideo(video.id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Validate
                                        </button>
                                        <button onClick={() => handleRemoveVideo(video.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
            <Modal isVisible={isModalVisible} onClose={closeModal}>
                <h2 className="text-xl font-semibold mb-2">Edit a video</h2>
                <div className="mb-4">
                    <VideoEditForm video={videoToEdit}/>
                </div>
                <div className="flex justify-end gap-4">
                    <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={closeModal}>
                        close
                    </button>
                </div>
            </Modal>
        </section>
    )
}