import React from 'react';

const FormGroup = ({ title, description, children }) => {
    return (
        <div className="mb-8">
            <div className="mb-4">
                <h3 className="text-lg font-bold">{title}</h3>
                {description && <p className="text-gray-400 mt-1">{description}</p>}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

export default FormGroup;
