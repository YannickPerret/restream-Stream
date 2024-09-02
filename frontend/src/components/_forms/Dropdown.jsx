import React from 'react';

const Dropdown = ({ label, options, value, onChange }) => {
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="bg-gray-900 text-white p-3 rounded-md border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Dropdown;
