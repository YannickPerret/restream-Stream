import React from 'react';

const FileUpload = ({ label, description, id, onChange, accept }) => {
    const handleFileChange = (file) => {
        const fileType = file.type.split('/')[0];

        if (accept.includes(fileType)) {
            onChange(file);
        } else {
            alert(`Please upload a valid ${accept.join(' or ')} file.`);
        }
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
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
                accept={accept.map(type => `${type}/*`).join(',')} // e.g., "image/*,video/*"
            />
        </div>
    );
};

export default FileUpload;
