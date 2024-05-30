import React, { useState } from 'react';
import FormGroup from "#components/forms/handleForm/formGroup";
import Form from "#components/forms/handleForm/form.jsx";

export default function GuestVideoUploadForm({ setVideoFile, onSubmitForm, isUploading }) {
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        video: '',
        username: '',
        email: '',
        displayName: '',
        discordUsername: '',
        steamUsername: '',
        twitchUsername: '',
        twitterUsername: '',
        youtubeUsername: '',
        telegramUsername: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormState((prevState) => ({ ...prevState, video: file }));
            setVideoFile(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(formState).forEach((key) => {
            formData.append(key, formState[key]);
        });
        onSubmitForm(formData);
    };

    return (
        <Form onSubmit={handleSubmit} title={'Send your own video'}>
            <FormGroup title={"Video information"} type={'column'}>
                <FormGroup type={'row'}>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        onChange={handleInputChange}
                        value={formState.title}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </FormGroup>

                <FormGroup type={'row'}>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        onChange={handleInputChange}
                        value={formState.description}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </FormGroup>

                <FormGroup type={'row'}>
                    <label htmlFor="video" className="block text-sm font-medium text-gray-700">Video</label>
                    <input
                        type="file"
                        id="video"
                        name="video"
                        required
                        onChange={handleFileChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </FormGroup>
            </FormGroup>

            <FormGroup title={"User information"}>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username (if already have upload video, make just your username)</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    onChange={handleInputChange}
                    value={formState.username}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    onChange={handleInputChange}
                    value={formState.email}
                    required
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />

                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    onChange={handleInputChange}
                    value={formState.displayName}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
            </FormGroup>

            <FormGroup title={"Social media"}>
                {['discordUsername', 'steamUsername', 'twitchUsername', 'twitterUsername', 'youtubeUsername', 'telegramUsername'].map((field) => (
                    <FormGroup key={field}>
                        <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                            {field.split('Username').join(' ')}
                        </label>
                        <input
                            type="text"
                            id={field}
                            name={field}
                            onChange={handleInputChange}
                            value={formState[field]}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </FormGroup>
                ))}
            </FormGroup>

            <FormGroup title="Validate">
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Submit'}
                </button>
            </FormGroup>
        </Form>
    );
}
