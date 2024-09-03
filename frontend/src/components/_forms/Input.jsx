import React from 'react';

const Input = ({ label, type = "text", name, value, onChange, placeholder, disabled = false }) => {
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="bg-gray-900 text-white p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={disabled}
            />
        </div>
    );
};

export default Input;
