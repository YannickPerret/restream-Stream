import React from 'react';

const Select = ({ label, options, value, onChange, required }) => {
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
            </label>
            <select
                className="mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 bg-gray-700 text-white"
                value={value}
                onChange={onChange}
                required={required}
            >
                {options.map((option, index) => (
                    <option
                        key={index}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;
