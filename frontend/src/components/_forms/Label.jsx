// frontend/src/components/_forms/Label.jsx
import React from 'react';

const Label = ({ htmlFor, children }) => {
    return (
        <label
            htmlFor={htmlFor}
            className="block text-sm font-medium text-gray-300 mb-1"
        >
            {children}
        </label>
    );
};

export default Label;
