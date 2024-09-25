import React from 'react';

const InputCalendar = ({ label, value, onChange, type = 'datetime-local', required = false }) => {
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="bg-gray-900 text-white p-3 rounded-md border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
        </div>
    );
};

export default InputCalendar;
