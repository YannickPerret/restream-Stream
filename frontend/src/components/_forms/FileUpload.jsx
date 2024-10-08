'use client';
import React, { useState } from 'react';

const FileUpload = ({ label, description, id, onChange, accept, multiple = false }) => {
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const files = e.target.files;
        onChange(files);
    };

    return (
        <div className="flex flex-col items-center border-2 border-dashed border-gray-700 p-6 rounded-md">
            <label htmlFor={id} className="text-sm text-gray-400 mb-1 cursor-pointer">
                {label}
            </label>
            <label htmlFor={id} className="text-center cursor-pointer">
                <p className="text-gray-400 mb-2">{description}</p>
                <div className="bg-gray-800 p-4 rounded cursor-pointer">
                    <p className="text-white">Click to upload</p>
                </div>
            </label>
            <input
                id={id}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept={accept.join(',')}
                multiple={multiple}
            />
        </div>
    );
};

export default FileUpload;
