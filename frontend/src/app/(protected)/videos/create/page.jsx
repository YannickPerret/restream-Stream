'use client'
import React, { useState } from 'react';
import VideoFileItem from '#components/videos/VideoFileItem';
import FormGroup from "#components/_forms/FormGroup";
import Input from "#components/_forms/Input";
import FileUpload from "#components/_forms/FileUpload";
import Button from "#components/_forms/Button";
import { VideoApi } from "#api/video.js";

export default function VideoCreatePage() {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFiles, setVideoFiles] = useState([]);
    const [videoDetails, setVideoDetails] = useState([]);
    const [uploadStatus, setUploadStatus] = useState({});

    const handleFileChange = (files) => {
        const updatedFiles = Array.from(files);
        setVideoFiles([...videoFiles, ...updatedFiles]);

        // Ajouter un item pour chaque vidéo uploadée
        const newDetails = updatedFiles.map(() => ({
            title: '',
            description: '',
            isPublished: false,
            showInLive: false,
        }));
        setVideoDetails((prevDetails) => [...prevDetails, ...newDetails]);
    };

    const handleVideoUpload = async (file, index, setUploadProgress) => {
        try {
            const { url, fields } = await VideoApi.getUploadPolicy(file);

            if (!url || !fields) {
                throw new Error('Invalid response from server, missing url or policy.');
            }
            const formData = new FormData();

            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value);
            });

            formData.append('file', file.name);

            console.log(file)

            const responseUpload = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            console.log(responseUpload);

            if (!responseUpload.ok) {
                throw new Error('Failed to upload the file to S3');
            }

            console.log(`File uploaded successfully to S3 at key: ${url}`);
            setVideoDetails((prevDetails) => {
                const updatedDetails = [...prevDetails];
                updatedDetails[index] = {
                    ...updatedDetails[index],
                    path: fields.key,
                };
                return updatedDetails;
            });

        } catch (error) {
            console.error('Error during video upload process:', error.message);
        }
    };

    const handleVideoDetailChange = (index, field, value) => {
        const updatedDetails = [...videoDetails];
        updatedDetails[index] = {
            ...updatedDetails[index],
            [field]: value,
        };
        setVideoDetails(updatedDetails);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (videoUrl) {
            try {
                const { video, signedUrl } = await VideoApi.create({
                    title: videoDetails[0]?.title || 'YouTube video',
                    description: videoDetails[0]?.description || 'Uploaded from YouTube',
                    videoUrl,
                });

                setVideoDetails((prevDetails) => [
                    ...prevDetails,
                    { title: video.title, description: video.description, isPublished: false, showInLive: false, path: signedUrl }
                ]);

                setVideoUrl('');
            } catch (error) {
                console.error('Error submitting YouTube video:', error);
            }
        }

        if (videoFiles.length > 0) {
            videoFiles.forEach((file, index) => {
                handleVideoUpload(file, index, setUploadProgress => {
                    setUploadStatus((prevStatus) => ({
                        ...prevStatus,
                        [index]: setUploadProgress
                    }));
                });
            });
        }
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Create a new Video</h1>
                </div>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>

                <div className="p-6">
                    <FormGroup title="Stream URL (YouTube or Twitch)" type={"column"}>
                        <Input
                            label="Stream URL"
                            type="url"
                            placeholder="Enter stream URL"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            pattern="https?://(www\.)?(youtube\.com|youtu\.be|twitch\.tv)/.*"
                        />
                        <Button label="Submit URL" onClick={handleSubmit} color="blue" />
                    </FormGroup>

                    <FormGroup title="Upload Video Files">
                        <FileUpload
                            label="Upload Video Files"
                            description="Upload one or more video files."
                            id="videoFiles"
                            accept={["video/mp4", "video/avi", "video/mov", "video/mts", "video/mkv", "video/webm"]}
                            multiple
                            onChange={handleFileChange}
                        />
                    </FormGroup>

                    <div className="uploaded-videos">
                        {videoDetails.map((video, index) => (
                            <VideoFileItem
                                key={index}
                                file={videoFiles[index]}
                                index={index}
                                videoDetails={video}
                                uploadStatus={uploadStatus[index]}
                                onDetailChange={handleVideoDetailChange}
                                onUpload={handleVideoUpload}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
