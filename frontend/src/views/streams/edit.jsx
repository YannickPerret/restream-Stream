'use client'
import Modal from "#components/modal/modal.jsx";
import StreamEditForm from "#components/forms/edit/stream.jsx";
import {useState} from "react";
import {useStreamStore} from "#stores/useStreamStore.js";
import useErrorStore from "#stores/useErrorStore.js";

export default function StreamsEditView({streamToEdit, onClose}) {
    const [isModalVisible, setIsModalVisible] = useState(true)
    const updateStream = useStreamStore.use.updateStreamById()
    const setError = useErrorStore.use.setError()
    const closeModal = () => {
        setIsModalVisible(false);
        onClose()
    };

    const handleSubmit = async (formdata) => {
        await updateStream(streamToEdit.id, formdata)
            .then(() => {
                closeModal()
            })
            .catch((error) => {
                setError(error)
            })
    }


    return (
        <Modal isVisible={isModalVisible} onClose={closeModal}>
            <h2 className="text-xl font-semibold mb-2">Edit a Stream</h2>
            <div className="mb-4">
                <StreamEditForm stream={streamToEdit} handleSubmit={handleSubmit} />
            </div>
            <div className="flex justify-end gap-4">
                <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={closeModal}>
                    close
                </button>
            </div>
        </Modal>
    )
}