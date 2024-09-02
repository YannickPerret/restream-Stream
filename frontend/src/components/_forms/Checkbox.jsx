import React from 'react';

const Checkbox = ({ label, description, checked, onChange }) => {
    return (
        <div className="flex items-start space-x-3">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-5 w-5 text-blue-600 bg-gray-900 rounded border-gray-700 focus:ring-blue-500"
            />
            <div className="text-sm">
                <label className="font-medium text-gray-300">{label}</label>
                {description && <p className="text-gray-400">{description}</p>}
            </div>
        </div>
    );
};

export default Checkbox;
