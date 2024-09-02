import React from 'react';

const TextArea = ({ label, placeholder, value, onChange }) => {
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">{label}</label>
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="bg-gray-900 text-white p-3 rounded-md border border-gray-700 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
        </div>
    );
};

export default TextArea;
