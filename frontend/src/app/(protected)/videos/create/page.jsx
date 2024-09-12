'use client';
import React, { useState } from 'react';
import VideoPreview from '#components/videos/preview';
import Form from "#components/_forms/Form";
import FormGroup from "#components/_forms/FormGroup";
import Input from "#components/_forms/Input";
import Checkbox from "#components/_forms/Checkbox";
import FileUpload from "#components/_forms/FileUpload";
import Button from "#components/_forms/Button";
import { useRouter } from 'next/navigation';
import { VideoApi } from '#api/video'; // API pour créer une vidéo

export default function VideoCreatePage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [showInLive, setShowInLive] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('isPublished', isPublished);
        formData.append('showInLive', showInLive);

        if (videoFile) formData.append('video', videoFile);
        if (thumbnail) formData.append('thumbnail', thumbnail);

        try {
            const response = await VideoApi.create(formData);
            router.push('/videos');
            console.log(response);
        } catch (error) {
            console.error(error);
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
                    {/* Affichage de la preview si la vidéo est sélectionnée */}
                    {videoFile && (
                        <VideoPreview videoUrl={URL.createObjectURL(videoFile)} />
                    )}

                    {/* Formulaire de création de vidéo */}
                    <Form onSubmit={handleSubmit}>
                        <FormGroup title="Video Details">
                            <Input
                                label="Title"
                                type="text"
                                placeholder="Enter Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <Input
                                label="Description"
                                type="textarea"
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </FormGroup>

                        <FormGroup title="Upload Video">
                            <FileUpload
                                label="Upload Video File"
                                accept={["video/mp4", "video/avi", "video/mov", "video/mts"]}
                                onChange={setVideoFile}
                            />
                        </FormGroup>

                        <FormGroup title="Upload Thumbnail">
                            <FileUpload
                                label="Upload Thumbnail"
                                accept={["image/png", "image/jpeg"]}
                                onChange={setThumbnail}
                            />
                        </FormGroup>

                        <FormGroup title="Options">
                            <Checkbox
                                label="Publish"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                            />
                            <Checkbox
                                label="Show in live streams"
                                checked={showInLive}
                                onChange={(e) => setShowInLive(e.target.checked)}
                            />
                        </FormGroup>

                        <div className="flex justify-end space-x-4">
                            <Button label="Reset" onClick={() => window.location.reload()} color="red" />
                            <Button label="Create Video" type="submit" color="blue" />
                        </div>
                    </Form>
                </div>
            </div>
        </section>
    );
}
