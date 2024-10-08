'use client'
import React, { useEffect } from 'react';
import Input from '#components/_forms/Input';
import Checkbox from '#components/_forms/Checkbox';

const VideoFileItem = ({ file, index, videoDetails = {}, onDetailChange, onUpload, uploadProgress }) => {
    useEffect(() => {
        if (file) {
            onUpload(file, index);
        }
    }, [file, index, onUpload]);

    const handleChange = (field, value) => {
        onDetailChange(index, field, value);
    };

    return (
        <div className="flex flex-col space-y-4 mb-4 bg-gray-800 p-4 rounded-lg">
            <div className="flex">
                {/* Preview de la vidéo à gauche */}
                <div className="w-1/3 flex flex-col justify-center">
                    <video className="w-full rounded-md" controls>
                        {videoDetails.path ? (
                            <source src={videoDetails.path} type="video/mp4" />
                        ) : (
                            <source src={URL.createObjectURL(file)} type={file?.type || "video/mp4"} />
                        )}
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Détails de la vidéo à droite */}
                <div className="w-2/3 pl-4">

                    <Input
                        label="Title"
                        type="text"
                        name={`title-${index}`}
                        value={videoDetails.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter title"
                    />

                    <Input
                        label="Description"
                        type="textarea"
                        name={`description-${index}`}
                        value={videoDetails.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Enter description"
                    />

                    <div className="flex space-x-4 mt-4">
                        <Checkbox
                            label="Show in Live"
                            checked={videoDetails.showInLive || true}
                            onChange={(e) => handleChange('showInLive', e.target.checked)}
                        />
                        <Checkbox
                            label="Publish"
                            checked={videoDetails.isPublished || true}
                            onChange={(e) => handleChange('isPublished', e.target.checked)}
                        />
                    </div>

                    {uploadProgress && (
                        <div className="w-full bg-gray-300 rounded-full h-2.5 mt-4">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoFileItem;
