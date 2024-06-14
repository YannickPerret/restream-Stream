'use client';
import { useState } from 'react';
import GuestVideoUploadForm from "#components/forms/guest/videoUpload.js";
import VideoPreview from "#components/videos/preview.jsx";
import { GuestApi } from "#api/guest.js";
import ReCAPTCHA from "react-google-recaptcha";

export default function GuestVideoUploadPage() {
    const [videoFile, setVideoFile] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [lastUploadTime, setLastUploadTime] = useState(null);
    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    const handleSubmitForm = async (formData) => {
        const now = new Date();
        if (lastUploadTime && (now - lastUploadTime) < 60000) {
            alert("Please wait at least 1 minute between uploads.");
            return;
        }

        if (!captchaToken) {
            alert("Please complete the captcha.");
            return;
        }

        formData.append('captchaToken', captchaToken);

        setIsUploading(true);

        await GuestApi.upload(formData)
            .then((response) => {
                console.log(response);
                setLastUploadTime(new Date());
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsUploading(false);
            });
    };

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Upload your own video</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />
                </header>

                <div>
                    {videoFile.length > 0 && (
                        <VideoPreview videoUrl={videoFile} />
                    )}

                    <GuestVideoUploadForm
                        setVideoFile={setVideoFile}
                        onSubmitForm={handleSubmitForm}
                        isUploading={isUploading}
                    />

                    <div className="my-4">
                        <ReCAPTCHA
                            sitekey={RECAPTCHA_SITE_KEY}
                            onChange={handleCaptchaChange}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
