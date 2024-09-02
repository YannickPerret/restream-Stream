import React from 'react';

const Button = ({ label, onClick, type = 'button' }) => {
    // Determine className based on button type
    const baseClass = "text-white font-bold py-2 px-4 rounded";
    const typeClass = type === 'reset'
        ? "bg-red-600 hover:bg-red-700"
        : type === 'submit'
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-600 hover:bg-gray-700";

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseClass} ${typeClass}`}
        >
            {label}
        </button>
    );
};

export default Button;
