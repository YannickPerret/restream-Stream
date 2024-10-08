import React from 'react';

const FormGroup = ({ title, description, children, type = 'column' }) => {
    return (
        <div className="mb-8">
            <div className="mb-4">
                <h3 className="text-lg font-bold">{title}</h3>
                {description && <p className="text-gray-400 mt-1">{description}</p>}
            </div>
            <div className={`flex ${type === 'row' ? 'flex-row gap-4' : 'flex-col gap-4'}`}>
                {React.Children.map(children, child => (
                    <div className="w-full">
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FormGroup;
