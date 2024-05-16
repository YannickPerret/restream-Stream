// components/Modal.js
import React from 'react';

const Modal = ({ isVisible, onClose, children }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
                <button className="absolute top-3 right-3 text-2xl" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
