'use client'
import useErrorStore from "#stores/useErrorStore";
import Modal from "#components/modal/modal";
import {useState} from "react";
import {useProviderStore} from "#stores/useProviderStore.js";
import ProviderEditForm from "#components/forms/edit/provider.jsx";

export default function ProvidersEditView({providerToEdit, onClose}) {
    const [isModalVisible, setIsModalVisible] = useState(true)
    const updateProvider = useProviderStore.use.updateProviderById()
    const setError = useErrorStore.use.setError()
    const closeModal = () => {
        setIsModalVisible(false);
        onClose()
    };

    const handleSubmit = async (formdata) => {
        await updateProvider(providerToEdit.id, formdata)
            .then(() => {
                closeModal()
            })
            .catch((error) => {
                setError(error)
            })
    }


    return (
        <Modal isVisible={isModalVisible} onClose={closeModal}>
            <h2 className="text-xl font-semibold mb-2">Edit a Provider</h2>
            <div className="mb-4">
                <ProviderEditForm provider={providerToEdit} handleSubmit={handleSubmit}/>
            </div>
            <div className="flex justify-end gap-4">
                <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={closeModal}>
                    close
                </button>
            </div>
        </Modal>
    )
}