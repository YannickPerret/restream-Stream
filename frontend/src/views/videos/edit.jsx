import {useState} from "react";
import useErrorStore from "#stores/useErrorStore";
import {useVideoStore} from "#stores/useVideoStore.js";
import Modal from "#components/modal/modal.jsx";
import VideoEditForm from "#components/forms/edit/video.jsx";

export default function VideosEditView({videoToEdit, onClose}) {
    const [isModalVisible, setIsModalVisible] = useState(true)
    const updateVideo = useVideoStore.use.updateVideoById()
    const setError = useErrorStore.use.setError()
    const closeModal = () => {
        setIsModalVisible(false);
        onClose()
    };

    const handleSubmit = async (formdata) => {
        console.log("tst")
        await updateVideo(videoToEdit.id, formdata)
            .then(() => {
                closeModal()
            })
            .catch((error) => {
                setError(error)
            })
    }

    return(
        <Modal isVisible={isModalVisible} onClose={closeModal}>
            <h2 className="text-xl font-semibold mb-2">Edit a Video</h2>
            <div className="mb-4">
                <VideoEditForm video={videoToEdit} handleSubmit={handleSubmit}/>
            </div>
            <div className="flex justify-end gap-4">
                <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={closeModal}>
                    close
                </button>
            </div>
        </Modal>
    )
}