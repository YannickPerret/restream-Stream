'use client';
import React, { useState, useEffect } from 'react';
import { StreamApi } from '#api/stream.js';
import Form from "#components/_forms/Form";
import FormGroup from "#components/_forms/FormGroup";
import Input from "#components/_forms/Input";
import Checkbox from "#components/_forms/Checkbox";
import FileUpload from "#components/_forms/FileUpload";
import Button from "#components/_forms/Button";
import SearchForm from "#components/_forms/Search";
import Dropdown from "#components/_forms/Dropdown.jsx";
import {useAuthStore} from "#stores/useAuthStore.js";
import AuthApi from "#api/auth.js";
import {useRouter} from "next/navigation";

export default function StreamCreate() {
    const [title, setTitle] = useState('');
    const [providers, setProviders] = useState([]);
    const [timeline, setTimeline] = useState(null);
    const [primaryProvider, setPrimaryProvider] = useState(null);
    const [runLive, setRunLive] = useState(false);
    const [logo, setLogo] = useState(null);
    const [overlay, setOverlay] = useState(null);
    const [quality, setQuality] = useState(''); // Set empty string as the default value
    const { subscriptions, setSubscriptions } = useAuthStore();
    const [availableQualities, setAvailableQualities] = useState([]);
    const [websiteUrl, setWebsiteUrl] = useState("");
    const router = useRouter()

    const handleSubmit = async (event) => {
        event.preventDefault();

        const providersWithPrimary = providers.map(provider => ({
            ...provider,
            onPrimary: provider.id === (primaryProvider?.id || null),
        }));

        console.log(quality)

        const formData = new FormData();
        formData.append('title', title);
        formData.append('timeline', timeline?.id);
        formData.append('runLive', runLive);
        formData.append('providers', JSON.stringify(providersWithPrimary));
        formData.append('quality', quality);
        formData.append('websiteUrl', websiteUrl);

        if (logo) formData.append('logo', logo);
        if (overlay) formData.append('overlay', overlay);

        try {
            const response = await StreamApi.create(formData);
            router.push('/streams');
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePrimaryChange = (provider) => {
        setPrimaryProvider(provider.id === primaryProvider?.id ? null : provider);
    };

    useEffect(() => {
        if (primaryProvider && !providers.some(provider => provider.id === primaryProvider.id)) {
            setPrimaryProvider(null);
        }

        const getSubscriptions = async () => {
            await AuthApi.getCurrentUser().then((data) => {
                setSubscriptions(data.subscriptions);

                // Check if subscriptions and its features are properly defined
                const subscription = data.subscriptions && data.subscriptions[0];
                if (subscription && subscription.features) {
                    const qualityFeature = subscription.features.find((feature) => feature.name === 'quality');
                    setAvailableQualities(qualityFeature ? qualityFeature.values : []);
                }
            });
        };

        getSubscriptions();
    }, [providers, setSubscriptions]);

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Create a new Stream</h1>
                </div>
                <hr className="border-b-1 border-blueGray-300 pb-6"/>

                <div className="p-6">
                    <Form onSubmit={handleSubmit}>
                        <FormGroup title="Stream Details">
                            <Input
                                label="Title"
                                type="text"
                                placeholder="Enter Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            <Dropdown
                                label="Quality"
                                options={availableQualities.map((quality) => ({
                                    label: quality,
                                    value: quality
                                }))}
                                value={quality || ''} // Set empty string if quality is null
                                onChange={(e) => setQuality(e.target.value)}
                                placeholder="Select a quality"
                            />
                        </FormGroup>

                        <FormGroup title="Timeline">
                            <SearchForm
                                label="Search for Timeline"
                                searchUrl="timelines"
                                multiple={false}
                                updateSelectedItems={setTimeline}
                            />
                            {timeline && (
                                <p className="mt-2">Selected Timeline: {timeline.title}</p>
                            )}
                        </FormGroup>

                        <FormGroup title="Providers">
                            <SearchForm
                                label="Search for Providers"
                                searchUrl="providers"
                                multiple={true}
                                updateSelectedItems={setProviders}
                            />
                            <div className="mt-4">
                                <p className="mb-2">Selected Providers: <span className="text-red-500">(Select one as primary)</span>
                                </p>
                                {providers.map(provider => (
                                    <Checkbox
                                        key={provider.id}
                                        label={provider.name}
                                        checked={primaryProvider?.id === provider.id}
                                        onChange={() => handlePrimaryChange(provider)}
                                    />
                                ))}
                            </div>
                        </FormGroup>

                        <FormGroup title="Assets">
                            <FileUpload
                                label="Upload Logo"
                                accept={["image"]}
                                onChange={setLogo}
                            />
                            <FileUpload
                                label="Upload Overlay"
                                accept={["image"]}
                                onChange={setOverlay}
                            />

                            <Input
                                label="Alerte Website"
                                type="text"
                                placeholder="Enter the alert webpage url"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                pattern="^(https:\/\/dashboard\.twitch\.tv\/widgets\/|https:\/\/streamlabs\.com\/alert-box\/|https:\/\/streamelements\.com\/overlay\/|https:\/\/widgets\.streamelements\.com\/host\/).*"
                                title="The URL must start with https://dashboard.twitch.tv/widgets/, https://streamlabs.com/alert-box/, https://streamelements.com/overlay/, or https://widgets.streamelements.com/host/"
                            />

                        </FormGroup>

                        <FormGroup title="Options">
                            <Checkbox
                                label="Launch live directly"
                                checked={runLive}
                                onChange={(e) => setRunLive(e.target.checked)}
                            />
                        </FormGroup>

                        <div className="flex justify-end space-x-4">
                            <Button label="Reset" onClick={() => window.location.reload()} color="red"/>
                            <Button label="Create" type="submit" color="blue"/>
                        </div>
                    </Form>
                </div>
            </div>
        </section>
    );
}
