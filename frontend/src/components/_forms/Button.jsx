import React from 'react';

const Button = ({ label, onClick, type = 'button', color, className }) => {
    // Determine className based on button type or custom color
    const baseClass = "text-white font-bold py-2 px-4 rounded";
    const typeClass = type === 'reset'
        ? "bg-red-600 hover:bg-red-700"
        : type === 'submit'
            ? "bg-blue-600 hover:bg-sky-700"
            : "bg-gray-600 hover:bg-gray-700";

    const colorClass = color
        ? `bg-${color}-600 hover:bg-${color}-700`
        : typeClass;

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseClass} ${colorClass} ${className}`}
        >
            {label}
        </button>
    );
};

export default Button;
