'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Form from "#components/_forms/Form";
import FormGroup from "#components/_forms/FormGroup";
import Select from "#components/_forms/Select";
import Button from "#components/_forms/Button";
import TwitchLoginButton from "#components/Twitch/TwitchLoginButton";
import YouTubeLoginButton from "#components/Youtube/YoutubeLoginButton.jsx";

export default function ProvidersCreatePage() {
    const [providerType, setProviderType] = useState("");
    const router = useRouter();

    const handleTwitchSuccess = () => {
        router.push('/providers/create/callback/twitch');
    };

    const handleYouTubeSuccess = () => {
        router.push('/providers/create/callback/youtube');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-gray-900 text-white p-8 rounded-t-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Create a Provider</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </div>
                <div className="p-6">
                    <Form onSubmit={handleSubmit}>
                        <FormGroup title="Provider Details">
                            <Select
                                label="Provider Type"
                                options={[
                                    {value: "", label: "Select an option", disabled: true},
                                    {value: "Twitch", label: "Twitch"},
                                    {value: "YouTube", label: "YouTube"},
                                    {value: "Facebook", label: "Facebook (Disabled)", disabled: true}
                                ]}
                                value={providerType}
                                onChange={(e) => setProviderType(e.target.value)}
                                required
                            />
                        </FormGroup>

                        {providerType === "Twitch" && (
                            <FormGroup title="Twitch Authentication">
                                <TwitchLoginButton onSuccess={handleTwitchSuccess}/>
                            </FormGroup>
                        )}

                        {providerType === "YouTube" && (
                            <FormGroup title="YouTube Authentication">
                                <YouTubeLoginButton onSuccess={handleYouTubeSuccess}/>
                            </FormGroup>
                        )}

                        <div className="flex justify-end space-x-4">
                            <Button label="Reset" type={"reset"}/>
                            <Button label="Next" type={"submit"}/>
                        </div>
                    </Form>
                </div>
            </div>
        </section>
    );
}
